from django.db import models
from django.utils.translation import gettext_lazy as _
from apps.platform.models.procedure import Procedure


class LabsProcedure(Procedure):
    """
    Modelo heredado de Procedure para solicitudes de laboratorio.
    Contiene campos específicos para trámites de reserva de laboratorios.
    """
    
    lab_name = models.CharField(
        max_length=200,
        verbose_name=_("Nombre del laboratorio"),
        help_text=_("Laboratorio solicitado")
    )
    
    equipment = models.TextField(
        verbose_name=_("Equipamiento necesario"),
        help_text=_("Descripción del equipamiento requerido")
    )
    
    start_date = models.DateTimeField(
        verbose_name=_("Fecha y hora de inicio"),
        help_text=_("Cuándo se requiere el laboratorio")
    )
    
    end_date = models.DateTimeField(
        verbose_name=_("Fecha y hora de fin"),
        help_text=_("Hasta cuándo se necesita el laboratorio")
    )
    
    purpose = models.TextField(
        verbose_name=_("Propósito de la solicitud"),
        help_text=_("Para qué se necesita el laboratorio")
    )
    
    expected_attendees = models.PositiveIntegerField(
        verbose_name=_("Personas esperadas"),
        help_text=_("Número estimado de participantes")
    )
    
    responsible_name = models.CharField(
        max_length=200,
        verbose_name=_("Responsable"),
        help_text=_("Persona responsable de la actividad")
    )
    
    responsible_phone = models.CharField(
        max_length=20,
        verbose_name=_("Teléfono del responsable"),
        help_text=_("Contacto del responsable")
    )
    
    responsible_email = models.EmailField(
        verbose_name=_("Email del responsable"),
        help_text=_("Correo del responsable")
    )

    class Meta:
        verbose_name = _("Solicitud de Laboratorio")
        verbose_name_plural = _("Solicitudes de Laboratorio")
        ordering = ["-created_at"]

    def __str__(self):
        return f"Laboratorio - {self.user.username} ({self.get_state_display()})"
