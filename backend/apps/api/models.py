from django.db import models
from django.utils.translation import gettext_lazy as _
from config.base_models import TimeStampedModel, StatusMixin


class Area(TimeStampedModel, StatusMixin):
    """
    Modelo para áreas o departamentos organizacionales
    """
    name = models.CharField(
        max_length=100,
        verbose_name=_("Nombre"),
        help_text=_("Nombre del área o departamento")
    )
    description = models.TextField(
        blank=True,
        verbose_name=_("Descripción"),
        help_text=_("Descripción detallada del área")
    )

    class Meta:
        verbose_name = _("Área")
        verbose_name_plural = _("Áreas")
        ordering = ['name']

    def __str__(self):
        return self.name
    