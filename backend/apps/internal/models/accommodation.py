from django.db import models
from django.utils.translation import gettext_lazy as _
from apps.platform.models.procedure import Procedure
from apps.platform.models.user import User
from .guest import Guest
from .feeding import FeedingDays


class AccommodationProcedure(Procedure):
    """
    Modelo heredado de Procedure para solicitudes de alojamiento.
    Contiene campos específicos para trámites de alojamiento.
    """
    ACCOMMODATION_CHOICES = [
        ('HOTEL', 'Instalaciones Hoteleras'),
        ('POSGRADO', 'Hotelito de posgrado de la UHO')
    ]
    
    accommodation_type = models.CharField(
        max_length=20,
        choices=ACCOMMODATION_CHOICES,
        verbose_name=_("Tipo de alojamiento"),
        help_text=_("Tipo de alojamiento solicitado")
    )
    
    start_day = models.DateField(
        verbose_name=_("Fecha de inicio"),
        help_text=_("Fecha de inicio del alojamiento")
    )
    
    end_day = models.DateField(
        verbose_name=_("Fecha de fin"),
        help_text=_("Fecha de fin del alojamiento")
    )
    
    description = models.TextField(
        verbose_name=_("Descripción"),
        help_text=_("Descripción detallada de la solicitud")
    )
    
    guests = models.ManyToManyField(
        Guest,
        related_name="accommodation_procedures",
        verbose_name=_("Huéspedes"),
        help_text=_("Huéspedes incluidos en el alojamiento")
    )
    
    feeding_days = models.ManyToManyField(
        FeedingDays,
        blank=True,
        related_name="accommodation_procedures",
        verbose_name=_("Días de alimentación"),
        help_text=_("Días en los que se solicita alimentación")
    )

    class Meta:
        verbose_name = _("Solicitud de Alojamiento")
        verbose_name_plural = _("Solicitudes de Alojamiento")
        ordering = ["-created_at"]

    def __str__(self):
        return f"Alojamiento - {self.user.username} ({self.get_state_display()})"
