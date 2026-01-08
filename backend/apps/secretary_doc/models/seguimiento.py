from django.db import models
from django.conf import settings
from .tramite import Tramite

class SeguimientoTramite(models.Model):
    """
    Modelo para realizar seguimiento de los cambios de estado de un trámite.
    """
    TIPO_CAMBIO_CHOICES = [
        ('creacion', 'Creación del trámite'),
        ('cambio_estado', 'Cambio de estado'),
        ('asignacion', 'Asignación de funcionario'),
        ('comentario', 'Comentario'),
        ('documento_agregado', 'Documento agregado'),
        ('documento_eliminado', 'Documento eliminado'),
        ('otro', 'Otro'),
    ]
    
    tramite = models.ForeignKey(
        Tramite,
        on_delete=models.CASCADE,
        related_name='seguimientos',
        verbose_name='Trámite'
    )
    fecha = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Fecha del evento'
    )
    usuario = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='seguimientos_realizados',
        verbose_name='Usuario que realizó el cambio'
    )
    tipo_cambio = models.CharField(
        max_length=50,
        choices=TIPO_CAMBIO_CHOICES,
        verbose_name='Tipo de cambio'
    )
    estado_anterior = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        verbose_name='Estado anterior'
    )
    estado_nuevo = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        verbose_name='Nuevo estado'
    )
    descripcion = models.TextField(
        verbose_name='Descripción del cambio',
        help_text='Detalle de los cambios realizados'
    )
    
    # Campos para auditoría
    ip_address = models.GenericIPAddressField(
        protocol='both',
        unpack_ipv4=False,
        null=True,
        blank=True,
        verbose_name='Dirección IP'
    )
    user_agent = models.TextField(
        blank=True,
        null=True,
        verbose_name='User Agent'
    )
    
    class Meta:
        verbose_name = 'Seguimiento de trámite'
        verbose_name_plural = 'Seguimientos de trámites'
        ordering = ['-fecha']
        indexes = [
            models.Index(fields=['tramite', 'fecha'], name='idx_seg_tramite_fecha'),
            models.Index(fields=['tipo_cambio'], name='idx_seg_tipo_cambio'),
        ]
    
    def __str__(self):
        return f"{self.get_tipo_cambio_display()} - {self.tramite} - {self.fecha}"
    
    @classmethod
    def registrar_cambio_estado(cls, tramite, usuario, estado_anterior, estado_nuevo, request=None, **kwargs):
        """
        Método de clase para registrar un cambio de estado de un trámite.
        """
        descripcion = f"El estado del trámite cambió de '{estado_anterior}' a '{estado_nuevo}'."
        if 'motivo' in kwargs:
            descripcion += f" Motivo: {kwargs['motivo']}"
            
        seguimiento = cls(
            tramite=tramite,
            usuario=usuario,
            tipo_cambio='cambio_estado',
            estado_anterior=estado_anterior,
            estado_nuevo=estado_nuevo,
            descripcion=descripcion,
        )
        
        if request:
            seguimiento.ip_address = request.META.get('REMOTE_ADDR')
            seguimiento.user_agent = request.META.get('HTTP_USER_AGENT', '')[:500]
            
        seguimiento.save()
        return seguimiento
