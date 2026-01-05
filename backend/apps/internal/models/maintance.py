from django.db import models
from django.utils.translation import gettext_lazy as _
from apps.platform.models.procedure import Procedure


class MaintanceProcedureType(models.Model):
    """Tipos de procedimientos de mantenimiento"""
    name = models.CharField(
        max_length=50,
        unique=True,
        verbose_name=_("Nombre"),
        help_text=_("Nombre del tipo de mantenimiento")
    )

    class Meta:
        verbose_name = _("Tipo de Procedimiento de Mantenimiento")
        verbose_name_plural = _("Tipos de Procedimientos de Mantenimiento")
        ordering = ["name"]

    def __str__(self):
        return self.name


class MaintancePriority(models.Model):
    """Niveles de prioridad para mantenimiento"""
    name = models.CharField(
        max_length=50,
        unique=True,
        verbose_name=_("Nombre"),
        help_text=_("Nombre del nivel de prioridad")
    )

    class Meta:
        verbose_name = _("Prioridad de Mantenimiento")
        verbose_name_plural = _("Prioridades de Mantenimiento")
        ordering = ["name"]

    def __str__(self):
        return self.name


class MaintanceProcedure(Procedure):
    """
    Modelo heredado de Procedure para solicitudes de mantenimiento.
    Contiene campos específicos para trámites de mantenimiento.
    """
    description = models.TextField(
        verbose_name=_("Descripción del problema"),
        help_text=_("Descripción detallada del problema o mantenimiento requerido")
    )
    
    picture = models.ImageField(
        upload_to="maintenance/images/",
        blank=True,
        null=True,
        verbose_name=_("Fotografía"),
        help_text=_("Fotografía del problema o área a mantener")
    )
    
    procedure_type = models.ForeignKey(
        MaintanceProcedureType,
        on_delete=models.SET_NULL,
        null=True,
        related_name="maintenance_procedures",
        verbose_name=_("Tipo de mantenimiento"),
        help_text=_("Tipo de procedimiento de mantenimiento")
    )
    
    priority = models.ForeignKey(
        MaintancePriority,
        on_delete=models.SET_NULL,
        null=True,
        related_name="maintenance_procedures",
        verbose_name=_("Prioridad"),
        help_text=_("Nivel de prioridad del mantenimiento")
    )

    class Meta:
        verbose_name = _("Solicitud de Mantenimiento")
        verbose_name_plural = _("Solicitudes de Mantenimiento")
        ordering = ["-created_at"]

    def __str__(self):
        return f"Mantenimiento - {self.user.username} ({self.get_state_display()})"
