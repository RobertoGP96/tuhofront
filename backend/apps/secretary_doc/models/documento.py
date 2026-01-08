from django.db import models
from django.conf import settings
import os

# Import the model using the correct name and path
from .procedure import SecretaryDocProcedure as Tramite

def documento_upload_path(instance, filename):
    """
    Función para definir la ruta de subida de los documentos.
    Formato: tramites/{tramite_id}/documentos/{filename}
    """
    return os.path.join(
        'tramites', 
        str(instance.tramite.id), 
        'documentos', 
        filename
    )

class Documento(models.Model):
    """
    Modelo para almacenar documentos asociados a un trámite.
    """
    TIPO_DOCUMENTO_CHOICES = [
        ('solicitud', 'Solicitud'),
        ('identidad', 'Documento de Identidad'),
        ('titulo', 'Título Académico'),
        ('certificado', 'Certificado de Notas'),
        ('pago', 'Comprobante de Pago'),
        ('otro', 'Otro Documento'),
    ]
    
    tramite = models.ForeignKey(
        Tramite,
        on_delete=models.CASCADE,
        related_name='documentos',
        verbose_name='Trámite asociado'
    )
    tipo = models.CharField(
        max_length=50,
        choices=TIPO_DOCUMENTO_CHOICES,
        verbose_name='Tipo de documento'
    )
    archivo = models.FileField(
        upload_to=documento_upload_path,
        verbose_name='Archivo',
        help_text='Subir archivo del documento'
    )
    nombre_original = models.CharField(
        max_length=255,
        blank=True,
        verbose_name='Nombre original del archivo'
    )
    fecha_subida = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Fecha de subida'
    )
    subido_por = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='documentos_subidos',
        verbose_name='Subido por'
    )
    observaciones = models.TextField(
        blank=True,
        null=True,
        verbose_name='Observaciones',
        help_text='Cualquier observación adicional sobre este documento'
    )
    
    class Meta:
        verbose_name = 'Documento'
        verbose_name_plural = 'Documentos'
        ordering = ['-fecha_subida']
        indexes = [
            models.Index(fields=['tramite', 'tipo'], name='idx_doc_tramite_tipo'),
        ]
    
    def __str__(self):
        return f"{self.get_tipo_display()} - {self.tramite}"
    
    def save(self, *args, **kwargs):
        if self.archivo and not self.nombre_original:
            self.nombre_original = self.archivo.name
        super().save(*args, **kwargs)
    
    def delete(self, *args, **kwargs):
        """
        Sobrescribe el método delete para eliminar el archivo físico
        cuando se elimina el registro de la base de datos.
        """
        storage, path = self.archivo.storage, self.archivo.path
        super().delete(*args, **kwargs)
        storage.delete(path)
