from django.db import models
from .base import BaseTramite
from .choices import (
    Intereses,
    Programa_Academico,
    Estado,
    Organismo,
    Tipo_Estudio,
    Tipo_Est,
    Uso,
    Uso_i,
    Tipo_Tramite_PreN,
    Tipo_Tramite_PreI,
    Tipo_Tramite_PosN,
    Tipo_Tramite_PosI,
)


class Tramite(BaseTramite):
    """
    Modelo principal para los trámites de la Secretaría Docente.
    Hereda de BaseTramite para campos comunes.
    """
    # Información del solicitante
    nombre = models.CharField(max_length=150, blank=False, null=False)
    apellidos = models.CharField(max_length=150, blank=False, null=False)
    ci = models.CharField(max_length=11, blank=False, null=False, unique=True)
    email = models.EmailField(max_length=50, blank=False, null=False)
    telefono = models.CharField(max_length=8, blank=False, null=False)
    
    # Información de identificación
    tomo = models.CharField(max_length=4, blank=False, null=False)
    folio = models.CharField(max_length=4, blank=False, null=False)
    numero = models.CharField(max_length=4, blank=False, null=False)
    
    # Información académica
    tipo_estudio = models.CharField(max_length=50, choices=Tipo_Estudio, blank=True)
    tipo_est = models.CharField(max_length=50, choices=Tipo_Est, blank=True)
    programa_academico = models.CharField(
        max_length=250, 
        choices=Programa_Academico,
        blank=True
    )
    nombre_programa = models.CharField(max_length=250, blank=True, null=True)
    carrera = models.CharField(max_length=100, blank=False, null=False)
    year = models.CharField(max_length=4, blank=False, null=False)
    
    # Detalles del trámite
    intereses = models.CharField(
        max_length=250, 
        choices=Intereses, 
        default="Estatal"
    )
    organismo = models.CharField(max_length=150, blank=True, null=True)
    organismo_op = models.CharField(
        max_length=250, 
        choices=Organismo, 
        blank=True
    )
    motivo = models.TextField(blank=True, null=True)
    
    # Tipos de trámite
    tipo_pren = models.CharField(
        max_length=50, 
        choices=Tipo_Tramite_PreN, 
        blank=True
    )
    tipo_prei = models.CharField(
        max_length=50, 
        choices=Tipo_Tramite_PreI, 
        blank=True
    )
    tipo_posn = models.CharField(
        max_length=50, 
        choices=Tipo_Tramite_PosN, 
        blank=True
    )
    tipo_posi = models.CharField(
        max_length=50, 
        choices=Tipo_Tramite_PosI, 
        blank=True
    )
    
    # Documentos
    archivo = models.FileField(
        upload_to='tramites/secretaria_docente/',
        null=True,
        blank=True
    )
    
    # Metadata
    class Meta:
        verbose_name = "Trámite"
        verbose_name_plural = "Trámites"
        ordering = ['-fecha_creacion']
        indexes = [
            models.Index(fields=['ci'], name='idx_tramite_ci'),
            models.Index(fields=['estado'], name='idx_tramite_estado'),
            models.Index(fields=['fecha_creacion'], name='idx_tramite_fecha_creacion'),
        ]
    
    def __str__(self):
        return f"{self.ci} - {self.nombre} {self.apellidos}"
    
    def save(self, *args, **kwargs):
        if not self.numero_seguimiento:
            # Generar número de seguimiento único
            from uuid import uuid4
            self.numero_seguimiento = str(uuid4())
        super().save(*args, **kwargs)
