"""
Views adicionales para el módulo labs:
- Check-in / check-out de una reserva
- Export iCal (.ics)
- Creación bulk desde una ReservationSeries
- Catálogo de equipamiento
"""
from __future__ import annotations

from datetime import datetime

from django.http import HttpResponse
from django.shortcuts import get_object_or_404
from rest_framework import permissions, serializers, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.audit.services import log_event

from .models import (
    Equipment,
    LocalEquipment,
    LocalReservation,
    ReservationCheckIn,
    ReservationSeries,
)


class EquipmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Equipment
        fields = '__all__'


class LocalEquipmentSerializer(serializers.ModelSerializer):
    equipment_name = serializers.CharField(source='equipment.name', read_only=True)

    class Meta:
        model = LocalEquipment
        fields = ('id', 'local', 'equipment', 'equipment_name', 'quantity', 'notes', 'operational')


class ReservationSeriesSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReservationSeries
        fields = '__all__'
        read_only_fields = ('id', 'created_at', 'created_by')


class CheckInSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReservationCheckIn
        fields = '__all__'
        read_only_fields = ('id', 'checked_in_at', 'checked_out_at', 'checked_in_by', 'reservation')


class EquipmentViewSet(viewsets.ModelViewSet):
    queryset = Equipment.objects.all()
    serializer_class = EquipmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_permissions(self):
        if self.action in ('create', 'update', 'partial_update', 'destroy'):
            return [permissions.IsAuthenticated(), permissions.IsAdminUser()]
        return super().get_permissions()


class LocalEquipmentViewSet(viewsets.ModelViewSet):
    queryset = LocalEquipment.objects.all().select_related('local', 'equipment')
    serializer_class = LocalEquipmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_permissions(self):
        if self.action in ('create', 'update', 'partial_update', 'destroy'):
            return [permissions.IsAuthenticated(), permissions.IsAdminUser()]
        return super().get_permissions()

    def get_queryset(self):
        qs = super().get_queryset()
        local_id = self.request.query_params.get('local')
        if local_id:
            qs = qs.filter(local_id=local_id)
        return qs


class ReservationSeriesViewSet(viewsets.ModelViewSet):
    queryset = ReservationSeries.objects.all()
    serializer_class = ReservationSeriesSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        instance = serializer.save(created_by=self.request.user)
        log_event(
            action='create',
            resource=instance,
            description='Serie de reservas creada',
        )

    @action(detail=True, methods=['post'])
    def expand(self, request, pk=None):
        """Genera las reservas reales a partir de la serie (con validación de conflictos)."""
        series = self.get_object()
        created, skipped = [], []
        for occ in series.expand():
            # Intentar crear la reserva; si hay conflicto, se saltea
            try:
                res = LocalReservation(
                    user=request.user,
                    local=series.local,
                    start_time=occ['start_time'],
                    end_time=occ['end_time'],
                    purpose=series.purpose,
                    purpose_detail=series.purpose_detail,
                    expected_attendees=series.expected_attendees,
                    responsible_name=series.responsible_name,
                    responsible_phone=series.responsible_phone,
                    responsible_email=series.responsible_email,
                    state='PENDIENTE',
                )
                res.save()
                created.append(str(res.pk))
            except Exception as exc:  # noqa: BLE001
                skipped.append({'start': str(occ['start_time']), 'error': str(exc)})
        log_event(
            action='create',
            resource=series,
            description='Expansión de serie',
            metadata={'created': len(created), 'skipped': len(skipped)},
        )
        return Response({'created': created, 'skipped': skipped})


def reservation_ical(request, pk):
    """Export iCal (.ics) de una reserva individual."""
    reservation = get_object_or_404(LocalReservation, pk=pk)
    # Permiso: dueño o staff
    if not (request.user.is_authenticated and (request.user.is_staff or reservation.user_id == request.user.id)):
        return HttpResponse(status=403)

    try:
        from icalendar import Calendar, Event
    except ImportError:
        return HttpResponse('icalendar no instalado', status=503)

    cal = Calendar()
    cal.add('prodid', '-//TUho//Reserva//ES')
    cal.add('version', '2.0')

    ev = Event()
    ev.add('summary', f'Reserva: {reservation.local.name}')
    ev.add('description', reservation.purpose_detail)
    ev.add('dtstart', reservation.start_time)
    ev.add('dtend', reservation.end_time)
    ev.add('location', f'{reservation.local.code} - {reservation.local.name}')
    ev.add('uid', f'reservation-{reservation.pk}@tuho.uho.edu.cu')
    ev.add('dtstamp', datetime.utcnow())
    cal.add_component(ev)

    response = HttpResponse(cal.to_ical(), content_type='text/calendar')
    response['Content-Disposition'] = f'attachment; filename="reserva-{reservation.pk}.ics"'
    return response


class CheckInView(viewsets.ViewSet):
    """Endpoints de check-in/out para reservas."""

    permission_classes = [permissions.IsAuthenticated]

    @action(detail=False, methods=['post'], url_path='check-in/(?P<pk>[^/.]+)')
    def check_in(self, request, pk=None):
        reservation = get_object_or_404(LocalReservation, pk=pk)
        if not (request.user.is_staff or reservation.user_id == request.user.id):
            return Response({'detail': 'No autorizado.'}, status=403)
        if reservation.state not in ('APROBADA', 'EN_CURSO'):
            return Response({'detail': 'La reserva no está aprobada.'}, status=400)

        from django.utils import timezone
        record, _ = ReservationCheckIn.objects.get_or_create(reservation=reservation)
        record.checked_in_at = timezone.now()
        record.checked_in_by = request.user
        record.save()

        if reservation.state == 'APROBADA':
            reservation.state = 'EN_CURSO'
            reservation.save(update_fields=['state'])

        log_event(action='check_in', resource=reservation, description='Check-in realizado')
        return Response(CheckInSerializer(record).data)

    @action(detail=False, methods=['post'], url_path='check-out/(?P<pk>[^/.]+)')
    def check_out(self, request, pk=None):
        reservation = get_object_or_404(LocalReservation, pk=pk)
        if not (request.user.is_staff or reservation.user_id == request.user.id):
            return Response({'detail': 'No autorizado.'}, status=403)

        from django.utils import timezone
        record = get_object_or_404(ReservationCheckIn, reservation=reservation)
        record.checked_out_at = timezone.now()
        attendance = request.data.get('attendance_count')
        if attendance:
            try:
                record.attendance_count = int(attendance)
            except (TypeError, ValueError):
                pass
        record.notes = request.data.get('notes', record.notes)
        record.save()

        reservation.state = 'FINALIZADA'
        reservation.save(update_fields=['state'])

        log_event(action='check_out', resource=reservation, description='Check-out realizado')
        return Response(CheckInSerializer(record).data)
