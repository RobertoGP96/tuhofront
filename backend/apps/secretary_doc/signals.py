from django.db.models.signals import post_save, pre_save, pre_delete
from django.dispatch import receiver
from django.core.exceptions import ValidationError
from django.utils import timezone

# Import models using the correct paths
from .models import (
    SecretaryDocProcedure as Tramite,
    SeguimientoTramite,
    Documento
)

@receiver(pre_save, sender=Tramite)
def tramite_pre_save(sender, instance, **kwargs):
    """
    Señal que se dispara antes de guardar un trámite.
    Se encarga de validar y preparar los datos del trámite.
    """
    # Validar que al menos un tipo de trámite esté seleccionado
    if not any([instance.tipo_pren, instance.tipo_prei, instance.tipo_posn, instance.tipo_posi]):
        raise ValidationError("Debe seleccionar al menos un tipo de trámite.")
    
    # Si es un nuevo trámite, establecer la fecha de creación
    if not instance.pk:
        instance.fecha_creacion = timezone.now()
    
    # Actualizar la fecha de modificación
    instance.fecha_actualizacion = timezone.now()

@receiver(post_save, sender=Tramite)
def tramite_post_save(sender, instance, created, **kwargs):
    """
    Señal que se dispara después de guardar un trámite.
    Se encarga de realizar acciones posteriores al guardado.
    """
    if created:
        # Registrar el seguimiento de creación
        SeguimientoTramite.objects.create(
            tramite=instance,
            tipo_cambio='creacion',
            estado_nuevo=instance.estado,
            descripcion=f"Trámite creado con estado: {instance.estado}",
            usuario=instance.usuario
        )

@receiver(pre_save, sender=Documento)
def documento_pre_save(sender, instance, **kwargs):
    """
    Señal que se dispara antes de guardar un documento.
    Se encarga de validar el documento.
    """
    # Validar el tipo de archivo y tamaño si es necesario
    if instance.archivo:
        # Aquí podrías agregar validaciones de tipo de archivo y tamaño
        pass

@receiver(pre_delete, sender=Documento)
def documento_pre_delete(sender, instance, **kwargs):
    """
    Señal que se dispara antes de eliminar un documento.
    Se encarga de limpiar los archivos asociados.
    """
    # El archivo se eliminará automáticamente gracias al método delete() del modelo
    pass

@receiver(post_save, sender=Documento)
def documento_post_save(sender, instance, created, **kwargs):
    """
    Señal que se dispara después de guardar un documento.
    Se encarga de registrar el seguimiento.
    """
    if created:
        SeguimientoTramite.objects.create(
            tramite=instance.tramite,
            tipo_cambio='documento_agregado',
            descripcion=f"Se agregó un documento de tipo {instance.get_tipo_display()}",
            usuario=instance.subido_por
        )

# Importar las señales al cargar la aplicación
def ready():
    # Este método se llama cuando la aplicación está lista
    # Importamos las señales para que se registren
    from . import signals  # noqa
