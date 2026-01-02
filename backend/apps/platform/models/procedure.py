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


class Procedure(TimeStampedModel, FollowNumberMixin):
    """
    Modelo base abstracto mejorado para todos los tipos de trámites.

    Proporciona funcionalidad común para el sistema de gestión de trámites
    universitarios con seguimiento, estados y auditoría.
    """

    id = models.AutoField(
        primary_key=True,
        verbose_name=_("ID del trámite"),
        default=uuid.uuid4,
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
        choices=ProcedureStateEnum,
        default="BORRADOR",
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

    def clean(self):
        """Validaciones personalizadas"""
        super().clean()

        # Validar fecha límite
        if self.deadline:
            from django.utils import timezone

            if self.deadline <= timezone.now():
                raise ValidationError(
                    {"deadline": _("La fecha límite debe ser futura.")}
                )

    def __str__(self):
        """Representación en string"""
        return f"{self.usuario.get_short_name()} - {self.get_estado_tramite_display()}"

    @property
    def is_pending(self):
        """Verifica si el trámite está pendiente"""
        return self.estado_tramite in ["ENVIADO", "EN_PROCESO", "REQUIERE_INFO"]

    @property
    def is_completed(self):
        """Verifica si el trámite está completado"""
        return self.estado_tramite in ["APROBADO", "FINALIZADO"]

    @property
    def is_expired(self):
        """Verifica si el trámite ha expirado"""
        if not self.deadline:
            return False
        from django.utils import timezone

        return timezone.now() > self.deadline
