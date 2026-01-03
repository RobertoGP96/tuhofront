from django.db import models

from labs.enums import LocalTypeEnum, ReservationStateEnum, ReservationPurposeEnum
from platform.models.procedure import Procedure

# Create your models here.
"""
Modelos para el sistema de reserva de locales universitarios.

Este módulo contiene los modelos simplificados para gestionar:
- Locales disponibles
- Reservas de espacios
"""

import uuid
from django.db import models
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _
from django.utils import timezone
from django.db.models import Q


# ============================================================================
# MODELO DE LOCAL
# ============================================================================


class Local(models.Model):
    """Local o espacio físico de la universidad"""

    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
        verbose_name=_("ID del local"),
    )

    name = models.CharField(
        max_length=200,
        verbose_name=_("Nombre del local"),
        help_text=_("Nombre descriptivo del local"),
    )

    code = models.CharField(
        max_length=50,
        unique=True,
        verbose_name=_("Código del local"),
        help_text=_("Código único identificador (ej: AULA-101, LAB-A)"),
    )

    local_type = models.CharField(
        max_length=20,
        choices=LocalTypeEnum.choices,
        verbose_name=_("Tipo de local"),
    )

    capacity = models.PositiveIntegerField(
        verbose_name=_("Capacidad"),
        help_text=_("Número máximo de personas"),
    )

    description = models.TextField(
        blank=True,
        verbose_name=_("Descripción"),
        help_text=_("Descripción general del local y sus características"),
    )

    image = models.ImageField(
        upload_to="locals/images/",
        null=True,
        blank=True,
        verbose_name=_("Imagen del local"),
    )

    is_active = models.BooleanField(
        default=True,
        verbose_name=_("Activo"),
        help_text=_("Indica si el local está disponible para reservas"),
    )

    requires_approval = models.BooleanField(
        default=True,
        verbose_name=_("Requiere aprobación"),
        help_text=_("Indica si las reservas requieren aprobación previa"),
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name=_("Fecha de creación"),
    )

    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name=_("Fecha de actualización"),
    )

    class Meta:
        verbose_name = _("Local")
        verbose_name_plural = _("Locales")
        ordering = ["code"]
        indexes = [
            models.Index(fields=["is_active", "local_type"]),
            models.Index(fields=["code"]),
        ]

    def __str__(self):
        return f"{self.code} - {self.name}"

    def is_available(self, start_time, end_time, exclude_reservation=None):
        """
        Verifica si el local está disponible en un rango de tiempo.

        Args:
            start_time: Fecha y hora de inicio
            end_time: Fecha y hora de fin
            exclude_reservation: Reserva a excluir (útil para ediciones)

        Returns:
            bool: True si está disponible, False si no
        """
        if not self.is_active:
            return False

        # Buscar reservas aprobadas que se solapen con el rango de tiempo
        overlapping = LocalReservation.objects.filter(
            local=self,
            state__in=[
                ReservationStateEnum.APROBADA,
                ReservationStateEnum.EN_CURSO,
                ReservationStateEnum.PENDIENTE,
            ],
        ).filter(Q(start_time__lt=end_time) & Q(end_time__gt=start_time))

        if exclude_reservation:
            overlapping = overlapping.exclude(id=exclude_reservation.id)

        return not overlapping.exists()

    def get_reservations_for_date(self, date):
        """
        Obtiene todas las reservas aprobadas para una fecha específica.

        Args:
            date: Fecha a consultar (datetime.date)

        Returns:
            QuerySet de reservas
        """
        from datetime import datetime, time

        start_of_day = datetime.combine(date, time.min)
        end_of_day = datetime.combine(date, time.max)

        return self.reservations.filter(
            state__in=[
                ReservationStateEnum.APROBADA,
                ReservationStateEnum.EN_CURSO,
            ],
            start_time__gte=start_of_day,
            start_time__lte=end_of_day,
        ).order_by("start_time")


# ============================================================================
# MODELO DE RESERVA
# ============================================================================


class LocalReservation(Procedure):
    """
    Trámite de reserva de local.

    Extiende el modelo base Procedure para gestionar reservas de locales
    con información específica de fechas, horarios y propósito.
    """

    local = models.ForeignKey(
        Local,
        on_delete=models.CASCADE,
        related_name="reservations",
        verbose_name=_("Local"),
        help_text=_("Local a reservar"),
    )

    start_time = models.DateTimeField(
        verbose_name=_("Fecha y hora de inicio"),
        help_text=_("Inicio de la reserva"),
    )

    end_time = models.DateTimeField(
        verbose_name=_("Fecha y hora de fin"),
        help_text=_("Fin de la reserva"),
    )

    purpose = models.CharField(
        max_length=20,
        choices=ReservationPurposeEnum.choices,
        verbose_name=_("Propósito de la reserva"),
    )

    purpose_detail = models.TextField(
        verbose_name=_("Detalle del propósito"),
        help_text=_("Descripción detallada de la actividad a realizar"),
    )

    expected_attendees = models.PositiveIntegerField(
        verbose_name=_("Asistentes esperados"),
        help_text=_("Número estimado de personas que asistirán"),
    )

    responsible_name = models.CharField(
        max_length=200,
        verbose_name=_("Nombre del responsable"),
        help_text=_("Persona responsable del evento/actividad"),
    )

    responsible_phone = models.CharField(
        max_length=20,
        verbose_name=_("Teléfono del responsable"),
    )

    responsible_email = models.EmailField(
        verbose_name=_("Email del responsable"),
    )

    setup_requirements = models.TextField(
        blank=True,
        verbose_name=_("Requerimientos especiales"),
        help_text=_("Disposición de mesas, sillas, equipos adicionales, etc."),
    )

    # Campos de aprobación
    approved_by = models.ForeignKey(
        "user.Usuario",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="approved_reservations",
        verbose_name=_("Aprobado por"),
    )

    approved_at = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name=_("Fecha de aprobación"),
    )

    rejection_reason = models.TextField(
        blank=True,
        verbose_name=_("Motivo de rechazo"),
    )

    cancellation_reason = models.TextField(
        blank=True,
        verbose_name=_("Motivo de cancelación"),
    )

    class Meta:
        verbose_name = _("Reserva de local")
        verbose_name_plural = _("Reservas de locales")
        ordering = ["-start_time"]
        indexes = [
            models.Index(fields=["local", "start_time", "end_time"]),
            models.Index(fields=["state", "start_time"]),
            models.Index(fields=["user", "state"]),
        ]

    def __str__(self):
        return f"{self.local.code} - {self.start_time.strftime('%d/%m/%Y %H:%M')} - {self.user.get_short_name()}"

    def clean(self):
        """Validaciones personalizadas"""
        super().clean()

        # Validar que end_time sea posterior a start_time
        if self.start_time and self.end_time and self.start_time >= self.end_time:
            raise ValidationError(
                {"end_time": _("La hora de fin debe ser posterior a la hora de inicio")}
            )

        # Validar que la reserva sea futura (solo para nuevas reservas)
        if not self.pk and self.start_time and self.start_time <= timezone.now():
            raise ValidationError(
                {"start_time": _("No se pueden hacer reservas en el pasado")}
            )

        # Validar duración máxima (8 horas)
        if self.start_time and self.end_time:
            duration = self.end_time - self.start_time
            if duration.total_seconds() > 8 * 3600:
                raise ValidationError(
                    {"end_time": _("La duración máxima de una reserva es de 8 horas")}
                )

            # Validar duración mínima (30 minutos)
            if duration.total_seconds() < 30 * 60:
                raise ValidationError(
                    {
                        "end_time": _(
                            "La duración mínima de una reserva es de 30 minutos"
                        )
                    }
                )

        # Validar capacidad
        if hasattr(self, "local") and self.expected_attendees > self.local.capacity:
            raise ValidationError(
                {
                    "expected_attendees": _(
                        f"El número de asistentes ({self.expected_attendees}) "
                        f"excede la capacidad del local ({self.local.capacity})"
                    )
                }
            )

        # Validar disponibilidad del local
        if hasattr(self, "local") and self.start_time and self.end_time:
            if not self.local.is_available(
                self.start_time,
                self.end_time,
                exclude_reservation=self if self.pk else None,
            ):
                raise ValidationError(
                    {
                        "local": _(
                            "El local no está disponible en el horario seleccionado"
                        )
                    }
                )

    def save(self, *args, **kwargs):
        """
        Guarda la reserva y actualiza el estado automáticamente
        basado en las fechas.
        """
        # Actualizar estado automáticamente basado en fechas
        if self.state == ReservationStateEnum.APROBADA:
            now = timezone.now()
            if self.start_time <= now <= self.end_time:
                self.state = ReservationStateEnum.EN_CURSO
            elif now > self.end_time:
                self.state = ReservationStateEnum.FINALIZADA

        super().save(*args, **kwargs)

    def submit(self):
        """Envía la reserva para aprobación"""
        if self.state != ReservationStateEnum.BORRADOR:
            raise ValidationError("Solo se pueden enviar reservas en borrador")

        # Si el local no requiere aprobación, aprobar automáticamente
        if not self.local.requires_approval:
            self.state = ReservationStateEnum.APROBADA
            self.approved_at = timezone.now()
        else:
            self.state = ReservationStateEnum.PENDIENTE

        self.save()

    def approve(self, approved_by):
        """
        Aprueba la reserva.

        Args:
            approved_by: Usuario que aprueba la reserva
        """
        if self.state != ReservationStateEnum.PENDIENTE:
            raise ValidationError("Solo se pueden aprobar reservas pendientes")

        self.state = ReservationStateEnum.APROBADA
        self.approved_by = approved_by
        self.approved_at = timezone.now()
        self.save()

    def reject(self, reason):
        """
        Rechaza la reserva.

        Args:
            reason: Motivo del rechazo
        """
        if self.state != ReservationStateEnum.PENDIENTE:
            raise ValidationError("Solo se pueden rechazar reservas pendientes")

        if not reason:
            raise ValidationError("Debe proporcionar un motivo de rechazo")

        self.state = ReservationStateEnum.RECHAZADA
        self.rejection_reason = reason
        self.save()

    def cancel(self, reason):
        """
        Cancela la reserva.

        Args:
            reason: Motivo de la cancelación
        """
        if self.state not in [
            ReservationStateEnum.PENDIENTE,
            ReservationStateEnum.APROBADA,
        ]:
            raise ValidationError("No se puede cancelar esta reserva")

        if self.start_time <= timezone.now():
            raise ValidationError("No se puede cancelar una reserva en curso o pasada")

        if not reason:
            raise ValidationError("Debe proporcionar un motivo de cancelación")

        self.state = ReservationStateEnum.CANCELADA
        self.cancellation_reason = reason
        self.save()

    @property
    def duration_hours(self):
        """Duración de la reserva en horas"""
        if self.start_time and self.end_time:
            duration = self.end_time - self.start_time
            return round(duration.total_seconds() / 3600, 2)
        return 0

    @property
    def duration_minutes(self):
        """Duración de la reserva en minutos"""
        if self.start_time and self.end_time:
            duration = self.end_time - self.start_time
            return int(duration.total_seconds() / 60)
        return 0

    @property
    def is_active(self):
        """Verifica si la reserva está activa (en curso)"""
        now = timezone.now()
        return (
            self.state in [ReservationStateEnum.APROBADA, ReservationStateEnum.EN_CURSO]
            and self.start_time <= now <= self.end_time
        )

    @property
    def is_upcoming(self):
        """Verifica si la reserva está próxima"""
        return (
            self.state == ReservationStateEnum.APROBADA
            and self.start_time > timezone.now()
        )

    @property
    def is_past(self):
        """Verifica si la reserva ya pasó"""
        return self.end_time < timezone.now()

    @property
    def can_be_edited(self):
        """Verifica si la reserva puede ser editada"""
        return (
            self.state
            in [ReservationStateEnum.BORRADOR, ReservationStateEnum.PENDIENTE]
            and not self.is_past
        )

    @property
    def can_be_cancelled(self):
        """Verifica si la reserva puede ser cancelada"""
        return (
            self.state
            in [ReservationStateEnum.PENDIENTE, ReservationStateEnum.APROBADA]
            and self.start_time > timezone.now()
        )


# ============================================================================
# MODELO DE HISTORIAL
# ============================================================================


class ReservationHistory(models.Model):
    """Historial de cambios en una reserva para auditoría"""

    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
    )

    reservation = models.ForeignKey(
        LocalReservation,
        on_delete=models.CASCADE,
        related_name="history",
        verbose_name=_("Reserva"),
    )

    user = models.ForeignKey(
        "user.Usuario",
        on_delete=models.SET_NULL,
        null=True,
        verbose_name=_("Usuario"),
        help_text=_("Usuario que realizó la acción"),
    )

    action = models.CharField(
        max_length=50,
        verbose_name=_("Acción"),
        help_text=_("Tipo de acción realizada (creación, edición, aprobación, etc.)"),
    )

    details = models.JSONField(
        default=dict,
        verbose_name=_("Detalles"),
        help_text=_("Información adicional sobre el cambio"),
    )

    timestamp = models.DateTimeField(
        auto_now_add=True,
        verbose_name=_("Fecha y hora"),
    )

    class Meta:
        verbose_name = _("Historial de reserva")
        verbose_name_plural = _("Historiales de reservas")
        ordering = ["-timestamp"]
        indexes = [
            models.Index(fields=["reservation", "-timestamp"]),
        ]

    def __str__(self):
        return f"{self.reservation.local.code} - {self.action} - {self.timestamp.strftime('%d/%m/%Y %H:%M')}"
