"""
Endpoints de documentos oficiales.

- GET /api/v1/documents/issued/                      → lista de documentos del usuario
- POST /api/v1/documents/issue/reservation/<id>/     → emite PDF de una reserva aprobada
- POST /api/v1/documents/issue/procedure/<id>/       → emite PDF de un trámite aprobado
- GET /api/v1/public/verify/<code>/                  → consulta pública por código/QR (no auth)
"""
from __future__ import annotations

from django.apps import apps
from django.http import Http404
from django.shortcuts import get_object_or_404
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action, api_view, permission_classes, throttle_classes
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle

from apps.audit.services import log_event

from .models import OfficialDocument
from .serializers import OfficialDocumentSerializer
from .services import issue_document


class OfficialDocumentViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = OfficialDocumentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = OfficialDocument.objects.all().select_related('issued_by', 'issued_to')
        if not user.is_staff:
            qs = qs.filter(issued_to=user)
        return qs

    @action(detail=False, methods=['post'], url_path='issue/reservation/(?P<pk>[^/.]+)')
    def issue_reservation(self, request, pk=None):
        try:
            LocalReservation = apps.get_model('labs', 'LocalReservation')
        except LookupError:
            return Response({'detail': 'Módulo labs no disponible.'}, status=503)

        reservation = get_object_or_404(LocalReservation, pk=pk)
        # Permiso: solo dueño, staff o aprobador
        if not (request.user.is_staff or reservation.user_id == request.user.id):
            return Response({'detail': 'No autorizado.'}, status=status.HTTP_403_FORBIDDEN)

        if reservation.state not in ('APROBADA', 'EN_CURSO', 'FINALIZADA'):
            return Response(
                {'detail': 'Solo se emiten documentos de reservas aprobadas.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        doc = issue_document(
            resource=reservation,
            template='documents/reservation.html',
            context={
                'reservation': reservation,
                'user_full_name': reservation.user.get_full_name() if reservation.user else '',
            },
            title=f'Reserva de {reservation.local.name}',
            issued_by=request.user,
            issued_to=reservation.user,
            doc_type=OfficialDocument.DocType.RESERVATION,
            filename_prefix='reserva',
        )
        log_event(
            action='document_generated',
            resource=reservation,
            description='PDF de reserva emitido',
            metadata={'document_id': str(doc.pk), 'code': doc.verification_code},
        )
        return Response(OfficialDocumentSerializer(doc, context={'request': request}).data, status=201)

    @action(detail=False, methods=['post'], url_path='issue/procedure/(?P<app_label>[^/.]+)/(?P<model>[^/.]+)/(?P<pk>[^/.]+)')
    def issue_procedure(self, request, app_label=None, model=None, pk=None):
        try:
            Model = apps.get_model(app_label, model)
        except LookupError:
            return Response({'detail': 'Modelo inexistente.'}, status=404)

        procedure = get_object_or_404(Model, pk=pk)
        user = getattr(procedure, 'user', None) or getattr(procedure, 'created_by', None)
        if not (request.user.is_staff or (user and user.id == request.user.id)):
            return Response({'detail': 'No autorizado.'}, status=status.HTTP_403_FORBIDDEN)

        if getattr(procedure, 'state', None) not in ('APROBADO', 'FINALIZADO', 'APROBADA', 'FINALIZADA'):
            return Response(
                {'detail': 'Solo se emiten documentos de trámites aprobados/finalizados.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        tracking = getattr(procedure, 'tracking_code', None) or getattr(procedure, 'get_follow_number_display', lambda: str(procedure.pk))()

        doc = issue_document(
            resource=procedure,
            template='documents/procedure_generic.html',
            context={
                'procedure': procedure,
                'user': user,
                'user_full_name': user.get_full_name() if user else '',
                'resource_name': Model._meta.verbose_name or Model.__name__,
                'tracking_code': tracking,
                'extra_fields': _extract_extra_fields(procedure),
            },
            title=f'Constancia — {Model._meta.verbose_name or Model.__name__}',
            issued_by=request.user,
            issued_to=user,
            doc_type=OfficialDocument.DocType.PROCEDURE,
            filename_prefix='constancia',
        )
        log_event(
            action='document_generated',
            resource=procedure,
            description='PDF de trámite emitido',
            metadata={'document_id': str(doc.pk), 'code': doc.verification_code},
        )
        return Response(OfficialDocumentSerializer(doc, context={'request': request}).data, status=201)


def _extract_extra_fields(procedure) -> dict:
    """Extrae campos adicionales comunes para el PDF (skip FKs grandes y archivos)."""
    from django.db import models as m
    exclude_types = (m.FileField, m.ImageField, m.ForeignKey, m.ManyToManyField)
    exclude_names = {'id', 'state', 'observation', 'deadline', 'created_at', 'updated_at',
                     'numero_seguimiento', 'user', 'procedure_ptr'}
    data = {}
    for field in procedure._meta.fields:
        if isinstance(field, exclude_types) or field.name in exclude_names:
            continue
        try:
            value = getattr(procedure, field.name, None)
            if value in (None, ''):
                continue
            label = str(field.verbose_name).title()
            data[label] = value
        except Exception:  # noqa: BLE001
            continue
    return data


# ---------- Endpoint público de verificación ----------

class PublicVerifyThrottle(ScopedRateThrottle):
    scope = 'public_tracking'


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
@throttle_classes([PublicVerifyThrottle])
def public_verify_document(request, code: str):
    """Retorna información no sensible de un documento dado su verification_code."""
    try:
        doc = OfficialDocument.objects.get(verification_code=code.upper())
    except OfficialDocument.DoesNotExist:
        raise Http404('Documento no encontrado.')

    return Response({
        'valid': not doc.revoked,
        'revoked': doc.revoked,
        'revoked_reason': doc.revoked_reason,
        'revoked_at': doc.revoked_at,
        'title': doc.title,
        'doc_type': doc.doc_type,
        'resource_type': doc.resource_type,
        'issued_at': doc.created_at,
        'expires_at': doc.expires_at,
        'verification_code': doc.verification_code,
    })
