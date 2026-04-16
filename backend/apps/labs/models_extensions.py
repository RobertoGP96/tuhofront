"""
Extensiones al módulo de reservas:

- LocalEquipment: inventario de equipamiento por local (M2M con Local).
- ReservationSeries: plantilla de reservas recurrentes (RRULE simplificado).
- ReservationCheckIn: registro de check-in/out de una reserva.

Estos modelos se integran con los existentes sin romper su esquema.
"""
import uuid

from django.db import models
from django.utils.translation import gettext_lazy as _

from .models import Local, LocalReservation


class Equipment(models.Model):
    """Catálogo de equipamiento disponible (proyector, pizarra, etc.)."""

    class Category(models.TextChoices):
        AUDIO = 'AUDIO', _('Audio')
        VIDEO = 'VIDEO', _('Video')
        COMPUTING = 'COMPUTING', _('Cómputo')
        FURNITURE = 'FURNITURE', _('Mobiliario')
        OTHER = 'OTHER', _('Otro')

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    code = models.CharField(max_length=50, unique=True)
    name = models.CharField(max_length=200)
    category = models.CharField(max_length=20, choices=Category.choices, default=Category.OTHER)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        verbose_name = _('Equipamiento')
        verbose_name_plural = _('Equipamiento')
        ordering = ['category', 'name']

    def __str__(self) -> str:
        return f'{self.code} · {self.name}'


class LocalEquipment(models.Model):
    """Equipamiento instalado en un local (inventario por sala)."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    local = models.ForeignKey(Local, on_delete=models.CASCADE, related_name='equipment_items')
    equipment = models.ForeignKey(Equipment, on_delete=models.CASCADE, related_name='locations')
    quantity = models.PositiveIntegerField(default=1)
    notes = models.CharField(max_length=200, blank=True)
    operational = models.BooleanField(default=True)

    class Meta:
        verbose_name = _('Inventario por local')
        verbose_name_plural = _('Inventarios por local')
        unique_together = [('local', 'equipment')]

    def __str__(self) -> str:
        return f'{self.local.code} · {self.equipment.name} x{self.quantity}'


class ReservationEquipmentRequest(models.Model):
    """Equipamiento solicitado para una reserva específica."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    reservation = models.ForeignKey(
        LocalReservation,
        on_delete=models.CASCADE,
        related_name='equipment_requests',
    )
    equipment = models.ForeignKey(Equipment, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    notes = models.CharField(max_length=200, blank=True)

    class Meta:
        verbose_name = _('Equipamiento solicitado')
        verbose_name_plural = _('Equipamiento solicitado')


class ReservationSeries(models.Model):
    """Plantilla de recurrencia para generar múltiples reservas.

    Soporta patrones simples (sin full RRULE):
    - DAILY: cada N días
    - WEEKLY: días específicos de la semana
    - MONTHLY: mismo día del mes
    """

    class Frequency(models.TextChoices):
        DAILY = 'DAILY', _('Diaria')
        WEEKLY = 'WEEKLY', _('Semanal')
        MONTHLY = 'MONTHLY', _('Mensual')

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    local = models.ForeignKey(Local, on_delete=models.CASCADE, related_name='series')
    created_by = models.ForeignKey('platform.User', on_delete=models.SET_NULL, null=True, related_name='+')

    frequency = models.CharField(max_length=10, choices=Frequency.choices)
    interval = models.PositiveSmallIntegerField(default=1, help_text=_('Cada cuántos días/semanas/meses'))
    weekdays = models.CharField(
        max_length=15,
        blank=True,
        help_text=_("Lista separada por coma de días de la semana (0=lunes...6=domingo)."),
    )

    start_date = models.DateField()
    end_date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()

    purpose = models.CharField(max_length=20)
    purpose_detail = models.TextField()
    expected_attendees = models.PositiveIntegerField()

    responsible_name = models.CharField(max_length=200)
    responsible_phone = models.CharField(max_length=20)
    responsible_email = models.EmailField()

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = _('Serie de reservas')
        verbose_name_plural = _('Series de reservas')
        ordering = ['-created_at']

    def expand(self) -> list[dict]:
        """Retorna una lista de {start_time, end_time} para cada ocurrencia.

        No crea las reservas — solo devuelve los datetimes. El caller decide
        si crearlas (y qué hacer con conflictos).
        """
        from datetime import datetime, timedelta
        from django.utils import timezone

        tz = timezone.get_current_timezone()
        occurrences: list[dict] = []
        cursor = self.start_date

        weekdays = {int(d) for d in self.weekdays.split(',') if d.strip().isdigit()} if self.weekdays else set()

        while cursor <= self.end_date:
            include = False
            if self.frequency == self.Frequency.DAILY:
                delta = (cursor - self.start_date).days
                include = delta % self.interval == 0
            elif self.frequency == self.Frequency.WEEKLY:
                # weekday en Python: Monday=0 .. Sunday=6
                include = cursor.weekday() in weekdays and ((cursor - self.start_date).days // 7) % self.interval == 0
            elif self.frequency == self.Frequency.MONTHLY:
                include = cursor.day == self.start_date.day

            if include:
                dt_start = datetime.combine(cursor, self.start_time)
                dt_end = datetime.combine(cursor, self.end_time)
                occurrences.append({
                    'start_time': timezone.make_aware(dt_start, tz),
                    'end_time': timezone.make_aware(dt_end, tz),
                })

            cursor += timedelta(days=1)
        return occurrences


class ReservationCheckIn(models.Model):
    """Check-in / check-out de una reserva (para QR en el día del evento)."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    reservation = models.OneToOneField(
        LocalReservation,
        on_delete=models.CASCADE,
        related_name='check_in',
    )
    checked_in_at = models.DateTimeField(null=True, blank=True)
    checked_in_by = models.ForeignKey('platform.User', on_delete=models.SET_NULL, null=True, blank=True, related_name='+')
    checked_out_at = models.DateTimeField(null=True, blank=True)
    attendance_count = models.PositiveIntegerField(null=True, blank=True)
    notes = models.TextField(blank=True)

    class Meta:
        verbose_name = _('Check-in de reserva')
        verbose_name_plural = _('Check-ins de reservas')
