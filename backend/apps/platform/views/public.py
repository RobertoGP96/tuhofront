"""
Endpoints públicos (sin autenticación) con throttling estricto.

Permiten a solicitantes externos consultar el estado de un trámite usando
su número de seguimiento + carnet de identidad como doble verificación,
y enviar un formulario de contacto al área de atención a la población.
"""
import logging

from django.apps import apps
from django.conf import settings
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiResponse
from rest_framework import permissions, serializers
from rest_framework.decorators import api_view, permission_classes, throttle_classes
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle

logger = logging.getLogger(__name__)


class TrackingResultSerializer(serializers.Serializer):
    """Respuesta del endpoint público de tracking."""

    found = serializers.BooleanField()
    resource_type = serializers.CharField(required=False)
    resource_name = serializers.CharField(required=False)
    state = serializers.CharField(required=False, allow_null=True)
    state_display = serializers.CharField(required=False, allow_null=True)
    created_at = serializers.DateTimeField(required=False, allow_null=True)
    updated_at = serializers.DateTimeField(required=False, allow_null=True)
    tracking_code = serializers.CharField(required=False)


class ContactResponseSerializer(serializers.Serializer):
    """Respuesta exitosa del endpoint de contacto."""

    detail = serializers.CharField()


class PublicTrackingThrottle(ScopedRateThrottle):
    scope = 'public_tracking'


class PublicContactThrottle(ScopedRateThrottle):
    scope = 'public_tracking'  # Reusa el throttle de tracking (20/min)


class ContactFormSerializer(serializers.Serializer):
    """Valida el formulario público de contacto."""

    username = serializers.CharField(max_length=120, required=True)
    lastname = serializers.CharField(max_length=120, required=True)
    id_card = serializers.CharField(max_length=11, required=True, allow_blank=True)
    email = serializers.EmailField(required=True)
    phone = serializers.CharField(max_length=20, required=False, allow_blank=True)
    address = serializers.CharField(max_length=300, required=False, allow_blank=True)
    subject = serializers.CharField(max_length=200, required=False, allow_blank=True)
    message = serializers.CharField(max_length=4000, required=True)

    def validate_message(self, value: str) -> str:
        if not value or not value.strip():
            raise serializers.ValidationError('El mensaje no puede estar vacío.')
        return value.strip()


def _find_procedure_by_code(code: str, id_card: str):
    """Busca un Procedure (en cualquier app) por numero_seguimiento y CI del solicitante."""
    import uuid as _uuid
    try:
        candidate_uuid = _uuid.UUID(code)
    except (ValueError, AttributeError):
        candidate_uuid = None

    # Apps conocidas que tienen modelos heredando de Procedure
    candidates = [
        ('internal', 'FeedingProcedure'),
        ('internal', 'AccommodationProcedure'),
        ('internal', 'TransportProcedure'),
        ('internal', 'MaintanceProcedure'),
        ('secretary_doc', 'SecretaryDocProcedure'),
        ('labs', 'LocalReservation'),
    ]

    for app_label, model_name in candidates:
        try:
            Model = apps.get_model(app_label, model_name)
        except LookupError:
            continue
        # Búsqueda por numero_seguimiento (uuid)
        qs = Model.objects.all()
        match = None
        if candidate_uuid:
            match = qs.filter(numero_seguimiento=candidate_uuid).first()
        if match is None and hasattr(Model, 'id'):
            try:
                match = qs.filter(pk=code).first()
            except (ValueError, TypeError):
                match = None
        if match is not None:
            user = getattr(match, 'user', None) or getattr(match, 'created_by', None)
            user_id_card = getattr(user, 'id_card', None) or getattr(match, 'id_card', None)
            if user_id_card and str(user_id_card).strip() == str(id_card).strip():
                return Model, match
    return None, None


@extend_schema(
    tags=['Public'],
    summary='Tracking público de trámite',
    description=(
        'Permite a solicitantes externos consultar el estado de un trámite '
        'usando el número de seguimiento + carnet de identidad como doble '
        'verificación. Sin autenticación. Throttle: 20/min por IP.'
    ),
    parameters=[
        OpenApiParameter(name='code', type=str, required=True,
                         description='Número de seguimiento (UUID o primer fragmento)'),
        OpenApiParameter(name='id_card', type=str, required=True,
                         description='Carnet de identidad del solicitante (11 dígitos)'),
    ],
    responses={
        200: TrackingResultSerializer,
        400: OpenApiResponse(description='Faltan parámetros obligatorios'),
        404: OpenApiResponse(description='Trámite no encontrado'),
    },
)
@api_view(['GET'])
@permission_classes([permissions.AllowAny])
@throttle_classes([PublicTrackingThrottle])
def public_procedure_tracking(request):
    """Consulta el estado de un trámite por `code` + `id_card` (sin login)."""
    code = request.query_params.get('code', '').strip()
    id_card = request.query_params.get('id_card', '').strip()

    if not code or not id_card:
        return Response(
            {'detail': 'Debe proporcionar code e id_card.'},
            status=400,
        )

    Model, procedure = _find_procedure_by_code(code, id_card)
    if procedure is None:
        # Respuesta genérica para no filtrar existencia
        return Response({'found': False}, status=404)

    return Response({
        'found': True,
        'resource_type': f'{Model._meta.app_label}.{Model._meta.object_name}',
        'resource_name': str(Model._meta.verbose_name or Model.__name__),
        'state': getattr(procedure, 'state', None),
        'state_display': procedure.get_state_display() if hasattr(procedure, 'get_state_display') else None,
        'created_at': getattr(procedure, 'created_at', None),
        'updated_at': getattr(procedure, 'updated_at', None),
        'tracking_code': str(getattr(procedure, 'numero_seguimiento', procedure.pk)),
    })


@extend_schema(
    tags=['Public'],
    summary='Formulario de contacto público',
    description=(
        'Recibe un mensaje del formulario "Atención a la población" y lo envía '
        'por email al soporte institucional (SUPPORT_EMAIL). Sin autenticación. '
        'Throttle: 20/min por IP.'
    ),
    request=ContactFormSerializer,
    responses={
        202: ContactResponseSerializer,
        400: OpenApiResponse(description='Errores de validación por campo'),
        502: OpenApiResponse(description='Email no se pudo enviar (SMTP caído)'),
    },
)
@api_view(['POST'])
@permission_classes([permissions.AllowAny])
@throttle_classes([PublicContactThrottle])
def public_contact(request):
    """Recibe un mensaje del formulario de contacto y lo encola para envío por email.

    El email se envía vía Celery (``send_email_task.delay``); en desarrollo
    (``CELERY_TASK_ALWAYS_EAGER=True``) se envía sincrónicamente.

    El destinatario es ``SUPPORT_EMAIL`` (configurable en .env, default
    ``soporte@uho.edu.cu``).

    Throttle: 20 req/min por IP para evitar abuso.
    """
    serializer = ContactFormSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=400)

    data = serializer.validated_data
    support_email = getattr(settings, 'SUPPORT_EMAIL', '') or getattr(
        settings, 'DEFAULT_FROM_EMAIL', 'soporte@uho.edu.cu'
    )

    full_name = f"{data['username']} {data['lastname']}".strip()
    subject_prefix = data.get('subject') or 'Atención a la población'
    email_subject = f"[Contacto Web] {subject_prefix} — {full_name}"

    body_lines = [
        f"Nombre completo: {full_name}",
        f"Carnet de identidad: {data.get('id_card', '—') or '—'}",
        f"Correo: {data['email']}",
        f"Teléfono: {data.get('phone', '—') or '—'}",
        f"Dirección: {data.get('address', '—') or '—'}",
        '',
        'Mensaje:',
        data['message'],
        '',
        f"-- Enviado desde el formulario web de {getattr(settings, 'INSTITUTION_NAME', 'TUho')}",
    ]
    email_body = '\n'.join(body_lines)

    try:
        from django.core.mail import send_mail
        send_mail(
            subject=email_subject,
            message=email_body,
            from_email=getattr(settings, 'DEFAULT_FROM_EMAIL', None),
            recipient_list=[support_email],
            fail_silently=False,
        )
    except Exception:
        logger.exception('No se pudo enviar email de contacto (from=%s)', data['email'])
        return Response(
            {'detail': 'No se pudo enviar el mensaje en este momento. Intentá más tarde.'},
            status=502,
        )

    return Response(
        {'detail': 'Mensaje recibido. Te contactaremos pronto.'},
        status=202,
    )
