from django.db import models
from django.utils.translation import gettext_lazy as _
from apps.platform.models.procedure import Procedure


class FeedingDays(models.Model):
    """Modelo para gestionar días de alimentación"""
    date = models.DateField(
        verbose_name=_("Fecha"),
        help_text=_("Fecha del día de alimentación")
    )
    breakfast = models.IntegerField(
        default=0,
        verbose_name=_("Desayunos"),
        help_text=_("Cantidad de desayunos")
    )
    lunch = models.IntegerField(
        default=0,
        verbose_name=_("Almuerzos"),
        help_text=_("Cantidad de almuerzos")
    )
    dinner = models.IntegerField(
        default=0,
        verbose_name=_("Cenas"),
        help_text=_("Cantidad de cenas")
    )
    snack = models.IntegerField(
        default=0,
        verbose_name=_("Meriendas"),
        help_text=_("Cantidad de meriendas")
    )

    class Meta:
        verbose_name = _("Día de Alimentación")
        verbose_name_plural = _("Días de Alimentación")
        ordering = ["date"]

    def __str__(self):
        return f"Alimentación - {self.date}"


class FeedingProcedure(Procedure):
    """
    Modelo heredado de Procedure para solicitudes de alimentación.
    Contiene campos específicos para trámites de alimentación.
    """
    FEEDING_CHOICES = [
        ("RESTAURANT", "Restaurante Especializado"),
        ("HOTELITO", "Hotelito de posgrado de la UHO"),
    ]

    feeding_type = models.CharField(
        max_length=20,
        choices=FEEDING_CHOICES,
        verbose_name=_("Tipo de alimentación"),
        help_text=_("Tipo de servicio de alimentación solicitado")
    )
    
    start_day = models.DateField(
        verbose_name=_("Fecha de inicio"),
        help_text=_("Fecha de inicio del servicio")
    )
    
    end_day = models.DateField(
        verbose_name=_("Fecha de fin"),
        help_text=_("Fecha de fin del servicio")
    )
    
    description = models.TextField(
        verbose_name=_("Descripción"),
        help_text=_("Descripción detallada de la solicitud")
    )
    
    amount = models.IntegerField(
        verbose_name=_("Cantidad de personas"),
        help_text=_("Número de personas a alimentar")
    )
    
    feeding_days = models.ManyToManyField(
        FeedingDays,
        related_name="feeding_procedures",
        verbose_name=_("Días de alimentación"),
        help_text=_("Días específicos de alimentación")
    )

    class Meta:
        verbose_name = _("Solicitud de Alimentación")
        verbose_name_plural = _("Solicitudes de Alimentación")
        ordering = ["-created_at"]

    def __str__(self):
        return f"Alimentación - {self.user.username} ({self.get_state_display()})"
