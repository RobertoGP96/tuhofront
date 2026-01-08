from django.db import models
from django.conf import settings
from apps.platform.models.procedure import Procedure
from apps.platform.models.user import User

class BaseTramite(models.Model):
    """Base model for all trámite types with common fields."""
    numero_seguimiento = models.CharField(max_length=36, blank=True, unique=True)
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True)
    estado = models.CharField(
        max_length=100,
        blank=False,
        null=False,
        default="En Espera"
    )
    usuario = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name='tramites_creados'
    )
    funcionario_responsable = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name='tramites_asignados'
    )

    class Meta:
        abstract = True
        ordering = ['-fecha_creacion']

    def __str__(self):
        return f"{self.numero_seguimiento} - {self.estado}"
