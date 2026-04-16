"""
Endpoints públicos (sin autenticación) con throttling estricto.

Permiten a solicitantes externos consultar el estado de un trámite usando
su número de seguimiento + carnet de identidad como doble verificación.
"""
from django.apps import apps
from rest_framework import permissions
from rest_framework.decorators import api_view, permission_classes, throttle_classes
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle


class PublicTrackingThrottle(ScopedRateThrottle):
    scope = 'public_tracking'


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
