
from django.forms import ValidationError
from plataforma.enums import ProcedureStateEnum
from plataforma.models import models
from config.base_models import FollowNumberMixin, StatusMixin
from usuarios.base_models import TimeStampedModel
from django.utils.translation import gettext_lazy as _
from model_utils.managers import InheritanceManager
from django.db.models import Q

class TramiteGeneral(TimeStampedModel, StatusMixin, FollowNumberMixin):
    """
    Modelo base abstracto mejorado para todos los tipos de trámites.
    
    Proporciona funcionalidad común para el sistema de gestión de trámites
    universitarios con seguimiento, estados y auditoría.
    """
    

    
    nombre_tramite = models.CharField(
        max_length=250,
        verbose_name=_("Nombre del trámite"),
        help_text=_("Tipo de trámite que se está procesando")
    )
    
    usuario = models.ForeignKey(
        'usuarios.Usuario',
        on_delete=models.CASCADE,
        related_name='%(class)s_tramites',
        verbose_name=_("Usuario solicitante"),
        help_text=_("Usuario que solicita el trámite")
    )
    
    estado_tramite = models.CharField(
        max_length=20,
        choices=ProcedureStateEnum,
        default='BORRADOR',
        verbose_name=_("Estado del trámite"),
        help_text=_("Estado actual del trámite")
    )
    
    observaciones = models.TextField(
        blank=True,
        null=True,
        verbose_name=_("Observaciones"),
        help_text=_("Observaciones o comentarios adicionales")
    )
    
    fecha_limite = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name=_("Fecha límite"),
        help_text=_("Fecha límite para completar el trámite")
    )
    
    # Manager personalizado
    objects = InheritanceManager()
    
    class Meta:
        abstract = True
        ordering = ['-created_at']

    def clean(self):
        """Validaciones personalizadas"""
        super().clean()
        
        # Validar fecha límite
        if self.fecha_limite:
            from django.utils import timezone
            if self.fecha_limite <= timezone.now():
                raise ValidationError({
                    'fecha_limite': _('La fecha límite debe ser futura.')
                })

    def __str__(self):
        """Representación en string"""
        return f"{self.nombre_tramite} - {self.usuario.get_short_name()} - {self.get_estado_tramite_display()}"

    def puede_editar(self, usuario):
        """Verifica si un usuario puede editar el trámite"""
        return (
            usuario == self.usuario or
            usuario.is_staff or
            usuario.is_superuser
        )

    def cambiar_estado(self, nuevo_estado, observacion=None, usuario=None):
        """Cambia el estado del trámite con auditoría"""
        estado_anterior = self.estado_tramite
        self.estado_tramite = nuevo_estado
        
        if observacion:
            if self.observaciones:
                self.observaciones += f"\n\n[{nuevo_estado}] {observacion}"
            else:
                self.observaciones = f"[{nuevo_estado}] {observacion}"
        
        self.save(update_fields=['estado_tramite', 'observaciones'])
        
        # Crear notificación al usuario
        from notificaciones.models import Notificacion
        Notificacion.crear_notificacion(
            tipo='PROCEDURE',
            asunto=f'Cambio de estado en trámite {self.nombre_tramite}',
            cuerpo=f'Su trámite ha cambiado de estado de "{estado_anterior}" a "{nuevo_estado}".',
            para=self.usuario,
            de=usuario
        )

    @property
    def is_pending(self):
        """Verifica si el trámite está pendiente"""
        return self.estado_tramite in ['BORRADOR', 'ENVIADO', 'EN_PROCESO', 'REQUIERE_INFO']

    @property
    def is_completed(self):
        """Verifica si el trámite está completado"""
        return self.estado_tramite in ['APROBADO', 'FINALIZADO']

    @property
    def is_expired(self):
        """Verifica si el trámite ha expirado"""
        if not self.fecha_limite:
            return False
        from django.utils import timezone
        return timezone.now() > self.fecha_limite


class EstadosTramites(TimeStampedModel, StatusMixin):
    """
    Modelo mejorado para gestión de estados de trámites.
    
    Permite configurar estados personalizados para diferentes tipos de trámites
    con flujos de trabajo específicos.
    """
    
    nombre = models.CharField(
        max_length=100,
        unique=True,
        verbose_name=_("Nombre del estado"),
        help_text=_("Nombre descriptivo del estado")
    )
    
    codigo = models.CharField(
        max_length=20,
        unique=True,
        verbose_name=_("Código del estado"),
        help_text=_("Código único del estado (sin espacios, mayúsculas)")
    )
    
    descripcion = models.TextField(
        blank=True,
        verbose_name=_("Descripción"),
        help_text=_("Descripción detallada del estado")
    )
    
    color = models.CharField(
        max_length=7,
        default='#007bff',
        verbose_name=_("Color"),
        help_text=_("Color hex para mostrar el estado en la interfaz")
    )
    
    icono = models.CharField(
        max_length=50,
        blank=True,
        verbose_name=_("Icono"),
        help_text=_("Nombre del icono para mostrar en la interfaz")
    )
    
    es_inicial = models.BooleanField(
        default=False,
        verbose_name=_("Estado inicial"),
        help_text=_("Indica si este es un estado inicial para nuevos trámites")
    )
    
    es_final = models.BooleanField(
        default=False,
        verbose_name=_("Estado final"),
        help_text=_("Indica si este es un estado final (no se puede cambiar)")
    )
    
    orden = models.PositiveIntegerField(
        default=0,
        verbose_name=_("Orden"),
        help_text=_("Orden de visualización del estado")
    )
    
    class Meta:
        verbose_name = _("Estado de trámite")
        verbose_name_plural = _("Estados de trámites")
        ordering = ['orden', 'nombre']
        constraints = [
            models.CheckConstraint(
                check=Q(nombre__isnull=False) & ~Q(nombre=''),
                name='estados_tramites_nombre_not_empty'
            ),
            models.CheckConstraint(
                check=Q(codigo__isnull=False) & ~Q(codigo=''),
                name='estados_tramites_codigo_not_empty'
            ),
        ]

    def clean(self):
        """Validaciones personalizadas"""
        super().clean()
        
        # Validar formato del código
        import re
        if not re.match(r'^[A-Z_]+$', self.codigo):
            raise ValidationError({
                'codigo': _('El código debe contener solo letras mayúsculas y guiones bajos.')
            })
        
        # Validar formato del color
        if not re.match(r'^#[0-9A-Fa-f]{6}$', self.color):
            raise ValidationError({
                'color': _('El color debe estar en formato hexadecimal (#RRGGBB).')
            })

    def __str__(self):
        """Representación en string"""
        return f"{self.nombre} ({self.codigo})"
  