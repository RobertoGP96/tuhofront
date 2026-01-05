from django.db import models
from django.utils.translation import gettext_lazy as _
from apps.platform.models.procedure import Procedure


class TransportProcedureType(models.Model):
    """Tipos de procedimientos de transporte"""
    name = models.CharField(
        max_length=50,
        unique=True,
        verbose_name=_("Nombre"),
        help_text=_("Nombre del tipo de transporte")
    )

    class Meta:
        verbose_name = _("Tipo de Procedimiento de Transporte")
        verbose_name_plural = _("Tipos de Procedimientos de Transporte")
        ordering = ["name"]

    def __str__(self):
        return self.name


class TransportProcedure(Procedure):
    """
    Modelo heredado de Procedure para solicitudes de transporte.
    Contiene campos específicos para trámites de transporte.
    """
    procedure_type = models.ForeignKey(
        TransportProcedureType,
        on_delete=models.SET_NULL,
        null=True,
        related_name="transport_procedures",
        verbose_name=_("Tipo de transporte"),
        help_text=_("Tipo de procedimiento de transporte")
    )
    
    departure_time = models.DateTimeField(
        verbose_name=_("Hora de salida"),
        help_text=_("Fecha y hora de salida")
    )
    
    return_time = models.DateTimeField(
        verbose_name=_("Hora de regreso"),
        help_text=_("Fecha y hora de regreso")
    )
    
    departure_place = models.CharField(
        max_length=150,
        verbose_name=_("Lugar de salida"),
        help_text=_("Lugar de salida del transporte")
    )
    
    return_place = models.CharField(
        max_length=150,
        verbose_name=_("Lugar de regreso"),
        help_text=_("Lugar de regreso del transporte")
    )
    
    passengers = models.IntegerField(
        verbose_name=_("Cantidad de pasajeros"),
        help_text=_("Número de personas a transportar")
    )
    
    description = models.TextField(
        verbose_name=_("Descripción"),
        help_text=_("Descripción detallada de la solicitud")
    )
    
    plate = models.CharField(
        max_length=10,
        blank=True,
        null=True,
        verbose_name=_("Placa del vehículo"),
        help_text=_("Placa del vehículo asignado")
    )
    
    round_trip = models.BooleanField(
        default=False,
        verbose_name=_("Viaje redondo"),
        help_text=_("Indica si es un viaje de ida y vuelta")
    )

    class Meta:
        verbose_name = _("Solicitud de Transporte")
        verbose_name_plural = _("Solicitudes de Transporte")
        ordering = ["-created_at"]

    def __str__(self):
        return f"Transporte - {self.user.username} ({self.get_state_display()})"
