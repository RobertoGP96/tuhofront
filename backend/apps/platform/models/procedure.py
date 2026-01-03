from datetime import timezone
import uuid
from django.forms import ValidationError
from platform.enums import ProcedureStateEnum
from platform.models import models
from backend.apps.platform.models.base_models import FollowNumberMixin, StatusMixin
from users.base_models import TimeStampedModel
from django.utils.translation import gettext_lazy as _
from model_utils.managers import InheritanceManager
from django.db.models import Q
from django.db import transaction


class ProcedureStateEnum(models.TextChoices):
    """Estados posibles de un trámite"""

    BORRADOR = "BORRADOR", _("Borrador")
    ENVIADO = "ENVIADO", _("Enviado")
    EN_PROCESO = "EN_PROCESO", _("En proceso")
    REQUIERE_INFO = "REQUIERE_INFO", _("Requiere información")
    APROBADO = "APROBADO", _("Aprobado")
    RECHAZADO = "RECHAZADO", _("Rechazado")
    FINALIZADO = "FINALIZADO", _("Finalizado")


class Procedure(TimeStampedModel, FollowNumberMixin):
    """
    Modelo base abstracto mejorado para todos los tipos de trámites.

    Proporciona funcionalidad común para el sistema de gestión de trámites
    universitarios con seguimiento, estados y auditoría.
    """

    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
        verbose_name=_("ID del trámite"),
        help_text=_("Identificador único del trámite"),
    )

    user = models.ForeignKey(
        "user.Usuario",
        on_delete=models.CASCADE,
        related_name="%(class)s_tramites",
        verbose_name=_("Usuario solicitante"),
        help_text=_("Usuario que solicita el trámite"),
    )

    state = models.CharField(
        max_length=20,
        choices=ProcedureStateEnum.choices,
        default=ProcedureStateEnum.BORRADOR,
        verbose_name=_("Estado del trámite"),
        help_text=_("Estado actual del trámite"),
    )

    observation = models.TextField(
        blank=True,
        null=True,
        verbose_name=_("Observaciones"),
        help_text=_("Observaciones o comentarios adicionales"),
    )

    deadline = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name=_("Fecha límite"),
        help_text=_("Fecha límite para completar el trámite"),
    )

    # Manager personalizado
    objects = InheritanceManager()

    class Meta:
        abstract = True
        ordering = ["-created_at"]
        verbose_name = _("Trámite")
        verbose_name_plural = _("Trámites")

    def clean(self):
        """Validaciones personalizadas"""
        super().clean()

        # Validar fecha límite
        if self.deadline and self.deadline <= timezone.now():
            raise ValidationError({"deadline": _("La fecha límite debe ser futura.")})

    def __str__(self):
        """Representación en string"""
        return f"{self.user.get_short_name()} - {self.get_state_display()}"

    @property
    def is_pending(self):
        """Verifica si el trámite está pendiente"""
        return self.state in [
            ProcedureStateEnum.ENVIADO,
            ProcedureStateEnum.EN_PROCESO,
            ProcedureStateEnum.REQUIERE_INFO,
        ]

    @property
    def is_completed(self):
        """Verifica si el trámite está completado"""
        return self.state in [
            ProcedureStateEnum.APROBADO,
            ProcedureStateEnum.FINALIZADO,
        ]

    @property
    def is_rejected(self):
        """Verifica si el trámite fue rechazado"""
        return self.state == ProcedureStateEnum.RECHAZADO

    @property
    def is_expired(self):
        """Verifica si el trámite ha expirado"""
        return self.deadline and timezone.now() > self.deadline

    def can_edit(self):
        """Verifica si el trámite puede ser editado"""
        return self.state == ProcedureStateEnum.BORRADOR

    def can_submit(self):
        """Verifica si el trámite puede ser enviado"""
        return self.state == ProcedureStateEnum.BORRADOR

    def submit(self):
        """Envía el trámite"""
        if self.can_submit():
            self.state = ProcedureStateEnum.ENVIADO
            self.save()
        else:
            raise ValidationError("No se puede enviar el trámite en su estado actual")

    def approve(self):
        """Aprueba el trámite"""
        if self.state == ProcedureStateEnum.EN_PROCESO:
            self.state = ProcedureStateEnum.APROBADO
            self.save()

    class Meta:
        abstract = True
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["state", "created_at"]),
            models.Index(fields=["user", "state"]),
            models.Index(fields=["deadline"]),
        ]
