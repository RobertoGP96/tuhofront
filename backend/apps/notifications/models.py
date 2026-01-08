from django.db import models
from django.utils.translation import gettext_lazy as _
from django.core.exceptions import ValidationError
from django.db.models import Q
from apps.platform.models import User as Usuario
from apps.platform.models.base_models import TimeStampedModel, StatusMixin


class NotificationManager(models.Manager):
    """Manager personalizado para notificaciones"""
    
    def unread(self):
        """Retorna solo notificaciones no leídas"""
        return self.filter(visto=False)
    
    def read(self):
        """Retorna solo notificaciones leídas"""
        return self.filter(visto=True)
    
    def by_user(self, user):
        """Retorna notificaciones de un usuario específico"""
        return self.filter(para=user)
    
    def by_type(self, tipo):
        """Retorna notificaciones de un tipo específico"""
        return self.filter(tipo=tipo)
    
    def recent(self, days=7):
        """Retorna notificaciones recientes (últimos N días)"""
        from datetime import datetime, timedelta
        cutoff_date = datetime.now() - timedelta(days=days)
        return self.filter(created_at__gte=cutoff_date)


class Notificacion(TimeStampedModel, StatusMixin):
    """
    Modelo para el sistema de notificaciones del sistema universitario.
    
    Permite enviar diferentes tipos de notificaciones a los usuarios
    con seguimiento de lectura y categorización.
    """
    
    # Tipos de notificación predefinidos
    TIPO_CHOICES = [
        ('INFO', _('Información')),
        ('WARNING', _('Advertencia')),
        ('ERROR', _('Error')),
        ('SUCCESS', _('Éxito')),
        ('SYSTEM', _('Sistema')),
        ('ACADEMIC', _('Académico')),
        ('PROCEDURE', _('Trámite')),
        ('MAINTENANCE', _('Mantenimiento')),
        ('URGENT', _('Urgente')),
    ]
    
    # Prioridad de la notificación
    PRIORIDAD_CHOICES = [
        ('LOW', _('Baja')),
        ('MEDIUM', _('Media')),
        ('HIGH', _('Alta')),
        ('CRITICAL', _('Crítica')),
    ]
    
    tipo = models.CharField(
        max_length=20,
        choices=TIPO_CHOICES,
        default='INFO',
        verbose_name=_("Tipo de notificación"),
        help_text=_("Categoría que define el tipo de notificación")
    )
    
    prioridad = models.CharField(
        max_length=10,
        choices=PRIORIDAD_CHOICES,
        default='MEDIUM',
        verbose_name=_("Prioridad"),
        help_text=_("Nivel de prioridad de la notificación")
    )
    
    asunto = models.CharField(
        max_length=255,
        verbose_name=_("Asunto"),
        help_text=_("Título o asunto de la notificación")
    )
    
    cuerpo = models.TextField(
        verbose_name=_("Contenido"),
        help_text=_("Contenido completo de la notificación")
    )
    
    para = models.ForeignKey(
        Usuario,
        on_delete=models.CASCADE,
        related_name='notificaciones',
        verbose_name=_("Destinatario"),
        help_text=_("Usuario que recibirá la notificación")
    )
    
    de = models.ForeignKey(
        Usuario,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='notificaciones_enviadas',
        verbose_name=_("Remitente"),
        help_text=_("Usuario que envió la notificación (puede ser automático)")
    )
    
    visto = models.BooleanField(
        default=False,
        verbose_name=_("Leído"),
        help_text=_("Indica si la notificación ha sido leída por el destinatario")
    )
    
    fecha_visto = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name=_("Fecha de lectura"),
        help_text=_("Fecha y hora en que se leyó la notificación")
    )
    
    # Campos adicionales útiles
    url_accion = models.URLField(
        blank=True,
        null=True,
        verbose_name=_("URL de acción"),
        help_text=_("URL opcional a la que redirigir cuando se hace clic en la notificación")
    )
    
    icono = models.CharField(
        max_length=50,
        blank=True,
        null=True,
        verbose_name=_("Icono"),
        help_text=_("Nombre del icono a mostrar (ej: 'fa-bell', 'info-circle')")
    )
    
    expira_en = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name=_("Fecha de expiración"),
        help_text=_("Fecha después de la cual la notificación se considera obsoleta")
    )
    
    datos_adicionales = models.JSONField(
        default=dict,
        blank=True,
        verbose_name=_("Datos adicionales"),
        help_text=_("Información adicional en formato JSON")
    )
    
    # Manager personalizado
    objects = NotificationManager()
    
    class Meta:
        app_label = 'notifications'
        verbose_name = _("Notificación")
        verbose_name_plural = _("Notificaciones")
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['para', 'visto']),
            models.Index(fields=['tipo', 'prioridad']),
            models.Index(fields=['created_at']),
            models.Index(fields=['expira_en']),
        ]
        constraints = [
            models.CheckConstraint(
                check=Q(asunto__isnull=False) & ~Q(asunto=''),
                name='notificacion_asunto_not_empty'
            ),
            models.CheckConstraint(
                check=Q(cuerpo__isnull=False) & ~Q(cuerpo=''),
                name='notificacion_cuerpo_not_empty'
            ),
        ]

    def clean(self):
        """Validaciones personalizadas a nivel de modelo"""
        super().clean()
        
        # Validar que la fecha de expiración sea futura
        if self.expira_en:
            from django.utils import timezone
            if self.expira_en <= timezone.now():
                raise ValidationError({
                    'expira_en': _('La fecha de expiración debe ser futura.')
                })
        
        # Validar longitud del asunto
        if len(self.asunto.strip()) < 5:
            raise ValidationError({
                'asunto': _('El asunto debe tener al menos 5 caracteres.')
            })
        
        # Validar longitud del cuerpo
        if len(self.cuerpo.strip()) < 10:
            raise ValidationError({
                'cuerpo': _('El contenido debe tener al menos 10 caracteres.')
            })

    def save(self, *args, **kwargs):
        """Sobrescribe save para lógica personalizada"""
        # Ejecutar validaciones
        self.full_clean()
        
        # Limpiar espacios en campos de texto
        self.asunto = self.asunto.strip()
        self.cuerpo = self.cuerpo.strip()
        
        # Asignar icono por defecto según el tipo
        if not self.icono:
            iconos_tipo = {
                'INFO': 'info-circle',
                'WARNING': 'exclamation-triangle',
                'ERROR': 'times-circle',
                'SUCCESS': 'check-circle',
                'SYSTEM': 'cog',
                'ACADEMIC': 'graduation-cap',
                'PROCEDURE': 'file-alt',
                'MAINTENANCE': 'tools',
                'URGENT': 'exclamation',
            }
            self.icono = iconos_tipo.get(self.tipo, 'bell')
        
        super().save(*args, **kwargs)

    def __str__(self):
        """Representación en string de la notificación"""
        status = "✓" if self.visto else "●"
        prioridad_icon = {
            'LOW': '🔵',
            'MEDIUM': '🟡',
            'HIGH': '🟠',
            'CRITICAL': '🔴'
        }.get(self.prioridad, '')
        
        return f"{status} {prioridad_icon} {self.asunto} - {self.para.get_short_name()}"

    def marcar_como_leido(self, usuario=None):
        """Marca la notificación como leída"""
        if usuario and usuario != self.para:
            raise ValidationError(_('Solo el destinatario puede marcar como leída esta notificación.'))
        
        if not self.visto:
            from django.utils import timezone
            self.visto = True
            self.fecha_visto = timezone.now()
            self.save(update_fields=['visto', 'fecha_visto'])

    def marcar_como_no_leido(self):
        """Marca la notificación como no leída"""
        if self.visto:
            self.visto = False
            self.fecha_visto = None
            self.save(update_fields=['visto', 'fecha_visto'])

    @property
    def is_expired(self):
        """Verifica si la notificación ha expirado"""
        if not self.expira_en:
            return False
        from django.utils import timezone
        return timezone.now() > self.expira_en

    @property
    def is_urgent(self):
        """Verifica si la notificación es urgente"""
        return self.prioridad == 'CRITICAL' or self.tipo == 'URGENT'

    @property
    def time_since_created(self):
        """Retorna el tiempo transcurrido desde la creación"""
        from django.utils import timezone
        from django.utils.timesince import timesince
        return timesince(self.created_at, timezone.now())

    @property
    def time_since_read(self):
        """Retorna el tiempo transcurrido desde que se leyó"""
        if not self.fecha_visto:
            return None
        from django.utils import timezone
        from django.utils.timesince import timesince
        return timesince(self.fecha_visto, timezone.now())

    def get_absolute_url(self):
        """Retorna la URL de la notificación"""
        if self.url_accion:
            return self.url_accion
        return f"/notificaciones/{self.pk}/"

    @classmethod
    def crear_notificacion(cls, tipo, asunto, cuerpo, para, de=None, prioridad='MEDIUM', **kwargs):
        """
        Método de clase para crear notificaciones de manera simplificada
        
        Args:
            tipo: Tipo de notificación
            asunto: Asunto de la notificación
            cuerpo: Contenido de la notificación
            para: Usuario destinatario
            de: Usuario remitente (opcional)
            prioridad: Prioridad de la notificación
            **kwargs: Campos adicionales
        """
        return cls.objects.create(
            tipo=tipo,
            asunto=asunto,
            cuerpo=cuerpo,
            para=para,
            de=de,
            prioridad=prioridad,
            **kwargs
        )

    @classmethod
    def notificar_multiple(cls, usuarios, tipo, asunto, cuerpo, de=None, **kwargs):
        """
        Crea notificaciones para múltiples usuarios
        
        Args:
            usuarios: Lista o QuerySet de usuarios
            tipo: Tipo de notificación
            asunto: Asunto de la notificación
            cuerpo: Contenido de la notificación
            de: Usuario remitente (opcional)
            **kwargs: Campos adicionales
        """
        notificaciones = []
        for usuario in usuarios:
            notificacion = cls(
                tipo=tipo,
                asunto=asunto,
                cuerpo=cuerpo,
                para=usuario,
                de=de,
                **kwargs
            )
            notificaciones.append(notificacion)
        
        return cls.objects.bulk_create(notificaciones)

    @classmethod
    def limpiar_expiradas(cls):
        """
        Método de clase para limpiar notificaciones expiradas
        """
        from django.utils import timezone
        expiradas = cls.objects.filter(
            expira_en__lt=timezone.now(),
            visto=True
        )
        count = expiradas.count()
        expiradas.delete()
        return count