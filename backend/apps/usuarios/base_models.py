"""
Modelos base y mixins reutilizables para toda la aplicación
"""
from django.db import models
from django.utils.translation import gettext_lazy as _
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
import uuid


class TimeStampedModel(models.Model):
    """
    Modelo abstracto que proporciona campos de timestamp automáticos
    """
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name=_("Fecha de creación"),
        help_text=_("Fecha y hora en que se creó el registro")
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name=_("Última modificación"),
        help_text=_("Fecha y hora de la última modificación")
    )

    class Meta:
        abstract = True
        ordering = ['-created_at']


class UUIDModel(models.Model):
    """
    Modelo abstracto que proporciona un campo UUID como clave primaria
    """
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
        verbose_name=_("ID único"),
        help_text=_("Identificador único universal del registro")
    )

    class Meta:
        abstract = True


class StatusMixin(models.Model):
    """
    Mixin para modelos que necesitan un campo de estado
    """
    STATUS_CHOICES = [
        ('ACTIVE', _('Activo')),
        ('INACTIVE', _('Inactivo')),
        ('PENDING', _('Pendiente')),
        ('COMPLETED', _('Completado')),
        ('CANCELLED', _('Cancelado')),
    ]

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='ACTIVE',
        verbose_name=_("Estado"),
        help_text=_("Estado actual del registro")
    )
    is_active = models.BooleanField(
        default=True,
        verbose_name=_("Está activo"),
        help_text=_("Indica si el registro está activo en el sistema")
    )

    class Meta:
        abstract = True

    def activate(self):
        """Activa el registro"""
        self.status = 'ACTIVE'
        self.is_active = True
        self.save(update_fields=['status', 'is_active'])

    def deactivate(self):
        """Desactiva el registro"""
        self.status = 'INACTIVE'
        self.is_active = False
        self.save(update_fields=['status', 'is_active'])

    def is_status(self, status):
        """Verifica si el registro tiene un estado específico"""
        return self.status == status


class TrackingMixin(models.Model):
    """
    Mixin para rastrear quién creó y modificó un registro
    """
    created_by = models.ForeignKey(
        'usuarios.Usuario',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='%(class)s_created',
        verbose_name=_("Creado por"),
        help_text=_("Usuario que creó el registro")
    )
    updated_by = models.ForeignKey(
        'usuarios.Usuario',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='%(class)s_updated',
        verbose_name=_("Modificado por"),
        help_text=_("Usuario que realizó la última modificación")
    )

    class Meta:
        abstract = True


class FollowNumberMixin(models.Model):
    """
    Mixin para modelos que necesitan número de seguimiento
    """
    numero_seguimiento = models.UUIDField(
        default=uuid.uuid4,
        unique=True,
        editable=False,
        verbose_name=_("Número de seguimiento"),
        help_text=_("Número único de seguimiento para el trámite")
    )

    class Meta:
        abstract = True

    def get_follow_number_display(self):
        """Retorna el número de seguimiento en formato legible"""
        return str(self.numero_seguimiento).upper()[:8]


class FileUploadMixin(models.Model):
    """
    Mixin para modelos que manejan archivos adjuntos
    """
    
    def get_upload_path(self, filename):
        """Genera la ruta de subida para archivos"""
        from datetime import datetime
        return f"{self.__class__.__name__}/{datetime.now().strftime('%Y/%m/%d')}/{filename}"

    class Meta:
        abstract = True


class SoftDeleteManager(models.Manager):
    """
    Manager para implementar soft delete
    """
    def get_queryset(self):
        return super().get_queryset().filter(is_deleted=False)

    def deleted(self):
        return super().get_queryset().filter(is_deleted=True)

    def all_with_deleted(self):
        return super().get_queryset()


class SoftDeleteMixin(models.Model):
    """
    Mixin para implementar soft delete (eliminación suave)
    """
    is_deleted = models.BooleanField(
        default=False,
        verbose_name=_("Está eliminado"),
        help_text=_("Indica si el registro ha sido eliminado lógicamente")
    )
    deleted_at = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name=_("Fecha de eliminación"),
        help_text=_("Fecha y hora en que se eliminó el registro")
    )

    objects = SoftDeleteManager()
    all_objects = models.Manager()

    class Meta:
        abstract = True

    def delete(self, using=None, keep_parents=False):
        """Sobrescribe delete para hacer soft delete"""
        from django.utils import timezone
        self.is_deleted = True
        self.deleted_at = timezone.now()
        self.save(update_fields=['is_deleted', 'deleted_at'])

    def hard_delete(self, using=None, keep_parents=False):
        """Elimina definitivamente el registro"""
        super().delete(using=using, keep_parents=keep_parents)

    def restore(self):
        """Restaura un registro eliminado"""
        self.is_deleted = False
        self.deleted_at = None
        self.save(update_fields=['is_deleted', 'deleted_at'])


class BaseModel(TimeStampedModel, StatusMixin, TrackingMixin, SoftDeleteMixin):
    """
    Modelo base que combina todos los mixins útiles
    """
    
    class Meta:
        abstract = True

    def clean(self):
        """Validaciones personalizadas a nivel de modelo"""
        super().clean()

    def save(self, *args, **kwargs):
        """Sobrescribe save para ejecutar validaciones"""
        self.full_clean()
        super().save(*args, **kwargs)