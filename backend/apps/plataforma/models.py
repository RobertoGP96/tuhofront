from django.db import models
from django.utils.translation import gettext_lazy as _
from django.core.exceptions import ValidationError
from django.db.models import Q
from datetime import datetime
from model_utils.managers import InheritanceManager
from usuarios.base_models import TimeStampedModel, StatusMixin, UUIDModel, FollowNumberMixin
from .validators import validate_file_extension, validate_document_extension, validate_file_size


class PlatformManager(models.Manager):
    """Manager base para modelos de la plataforma"""
    
    def active(self):
        """Retorna solo registros activos"""
        return self.filter(is_active=True)
    
    def published(self):
        """Retorna solo contenido publicado"""
        return self.filter(status='ACTIVE')


class NewsManager(PlatformManager):
    """Manager específico para noticias"""
    
    def recent(self, days=30):
        """Retorna noticias recientes"""
        from datetime import datetime, timedelta
        cutoff_date = datetime.now() - timedelta(days=days)
        return self.filter(created_at__gte=cutoff_date, is_active=True)
    
    def by_year(self, year):
        """Retorna noticias de un año específico"""
        return self.filter(created_at__year=year)


def get_news_upload_path(instance, filename):
    """Genera la ruta de subida para imágenes de noticias"""
    date_path = datetime.now().strftime('%Y/%m/%d')
    return f"noticias/{date_path}/{filename}"


class Noticias(TimeStampedModel, StatusMixin):
    """
    Modelo mejorado para noticias del sistema universitario.
    
    Gestiona las noticias y anuncios que se publican en la plataforma,
    con soporte para imágenes, categorización y programación de publicación.
    """
    
    CATEGORIA_CHOICES = [
        ('GENERAL', _('General')),
        ('ACADEMICA', _('Académica')),
        ('ADMINISTRATIVA', _('Administrativa')),
        ('ESTUDIANTIL', _('Estudiantil')),
        ('CULTURAL', _('Cultural')),
        ('DEPORTIVA', _('Deportiva')),
        ('INVESTIGACION', _('Investigación')),
        ('EXTENSION', _('Extensión Universitaria')),
    ]
    
    titulo = models.CharField(
        max_length=255,
        verbose_name=_("Título"),
        help_text=_("Título de la noticia (máximo 255 caracteres)")
    )
    
    slug = models.SlugField(
        max_length=255,
        unique=True,
        blank=True,
        verbose_name=_("URL amigable"),
        help_text=_("URL amigable generada automáticamente del título")
    )
    
    categoria = models.CharField(
        max_length=20,
        choices=CATEGORIA_CHOICES,
        default='GENERAL',
        verbose_name=_("Categoría"),
        help_text=_("Categoría de la noticia")
    )
    
    imagen_cabecera = models.ImageField(
        upload_to=get_news_upload_path,
        blank=True,
        null=True,
        validators=[validate_file_extension, validate_file_size],
        verbose_name=_("Imagen de cabecera"),
        help_text=_("Imagen principal de la noticia (opcional)")
    )
    
    resumen = models.CharField(
        max_length=300,
        blank=True,
        null=True,
        verbose_name=_("Resumen"),
        help_text=_("Breve resumen de la noticia (máximo 300 caracteres)")
    )
    
    cuerpo = models.TextField(
        verbose_name=_("Contenido"),
        help_text=_("Contenido completo de la noticia")
    )
    
    autor = models.ForeignKey(
        'usuarios.Usuario',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='noticias_creadas',
        verbose_name=_("Autor"),
        help_text=_("Usuario que creó la noticia")
    )
    
    publicado = models.BooleanField(
        default=False,
        verbose_name=_("Publicado"),
        help_text=_("Indica si la noticia está publicada")
    )
    
    fecha_publicacion = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name=_("Fecha de publicación"),
        help_text=_("Fecha programada para publicar la noticia")
    )
    
    destacada = models.BooleanField(
        default=False,
        verbose_name=_("Destacada"),
        help_text=_("Indica si la noticia debe aparecer destacada")
    )
    
    visitas = models.PositiveIntegerField(
        default=0,
        verbose_name=_("Visitas"),
        help_text=_("Número de veces que se ha visualizado la noticia")
    )
    
    tags = models.CharField(
        max_length=255,
        blank=True,
        verbose_name=_("Etiquetas"),
        help_text=_("Etiquetas separadas por comas para facilitar búsquedas")
    )
    
    # Manager personalizado
    objects = NewsManager()
    
    class Meta:
        verbose_name = _("Noticia")
        verbose_name_plural = _("Noticias")
        ordering = ['-fecha_publicacion', '-created_at']
        indexes = [
            models.Index(fields=['publicado', 'fecha_publicacion']),
            models.Index(fields=['categoria', 'publicado']),
            models.Index(fields=['destacada', 'publicado']),
            models.Index(fields=['slug']),
        ]
        constraints = [
            models.CheckConstraint(
                check=Q(titulo__isnull=False) & ~Q(titulo=''),
                name='titulo_not_empty'
            ),
            models.CheckConstraint(
                check=Q(cuerpo__isnull=False) & ~Q(cuerpo=''),
                name='cuerpo_not_empty'
            ),
        ]

    def clean(self):
        """Validaciones personalizadas"""
        super().clean()
        
        # Validar longitud del título
        if len(self.titulo.strip()) < 10:
            raise ValidationError({
                'titulo': _('El título debe tener al menos 10 caracteres.')
            })
        
        # Validar longitud del contenido
        if len(self.cuerpo.strip()) < 50:
            raise ValidationError({
                'cuerpo': _('El contenido debe tener al menos 50 caracteres.')
            })
        
        # Validar resumen si se proporciona
        if self.resumen and len(self.resumen.strip()) < 20:
            raise ValidationError({
                'resumen': _('El resumen debe tener al menos 20 caracteres.')
            })

    def save(self, *args, **kwargs):
        """Sobrescribe save para lógica personalizada"""
        # Generar slug automáticamente si no existe
        if not self.slug:
            from django.utils.text import slugify
            base_slug = slugify(self.titulo)
            slug = base_slug
            counter = 1
            
            while Noticias.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
            
            self.slug = slug
        
        # Ejecutar validaciones
        self.full_clean()
        
        # Establecer fecha de publicación si se marca como publicado
        if self.publicado and not self.fecha_publicacion:
            from django.utils import timezone
            self.fecha_publicacion = timezone.now()
        
        super().save(*args, **kwargs)

    def __str__(self):
        """Representación en string"""
        status = "📰" if self.publicado else "📝"
        destacada = "⭐" if self.destacada else ""
        return f"{status}{destacada} {self.titulo}"

    def incrementar_visitas(self):
        """Incrementa el contador de visitas"""
        self.visitas += 1
        self.save(update_fields=['visitas'])

    def get_absolute_url(self):
        """Retorna la URL absoluta de la noticia"""
        return f"/noticias/{self.slug}/"

    @property
    def is_published(self):
        """Verifica si la noticia está publicada y activa"""
        return self.publicado and self.is_active

    @property
    def can_be_published(self):
        """Verifica si la noticia puede ser publicada"""
        return bool(self.titulo and self.cuerpo and self.is_active)


class Email(TimeStampedModel, StatusMixin):
    """
    Modelo mejorado para configuración de emails del sistema.
    
    Gestiona las cuentas de email utilizadas para el envío de notificaciones
    y comunicaciones automáticas del sistema.
    """
    
    TIPO_CHOICES = [
        ('SMTP', _('SMTP Estándar')),
        ('GMAIL', _('Gmail')),
        ('OUTLOOK', _('Outlook/Hotmail')),
        ('CUSTOM', _('Personalizado')),
    ]
    
    nombre = models.CharField(
        max_length=100,
        verbose_name=_("Nombre identificativo"),
        help_text=_("Nombre para identificar esta configuración de email")
    )
    
    address = models.EmailField(
        unique=True,
        verbose_name=_("Dirección de email"),
        help_text=_("Dirección de correo electrónico")
    )
    
    tipo = models.CharField(
        max_length=10,
        choices=TIPO_CHOICES,
        default='SMTP',
        verbose_name=_("Tipo de servidor"),
        help_text=_("Tipo de servidor de correo electrónico")
    )
    
    smtp_server = models.CharField(
        max_length=255,
        verbose_name=_("Servidor SMTP"),
        help_text=_("Dirección del servidor SMTP")
    )
    
    smtp_port = models.PositiveIntegerField(
        default=587,
        verbose_name=_("Puerto SMTP"),
        help_text=_("Puerto del servidor SMTP (usualmente 587 o 465)")
    )
    
    smtp_username = models.CharField(
        max_length=255,
        verbose_name=_("Usuario SMTP"),
        help_text=_("Nombre de usuario para autenticación SMTP")
    )
    
    smtp_password = models.CharField(
        max_length=255,
        verbose_name=_("Contraseña SMTP"),
        help_text=_("Contraseña para autenticación SMTP")
    )
    
    use_tls = models.BooleanField(
        default=True,
        verbose_name=_("Usar TLS"),
        help_text=_("Utilizar cifrado TLS para la conexión")
    )
    
    use_ssl = models.BooleanField(
        default=False,
        verbose_name=_("Usar SSL"),
        help_text=_("Utilizar cifrado SSL para la conexión")
    )
    
    is_default = models.BooleanField(
        default=False,
        verbose_name=_("Configuración por defecto"),
        help_text=_("Usar esta configuración como predeterminada")
    )
    
    class Meta:
        verbose_name = _("Configuración de Email")
        verbose_name_plural = _("Configuraciones de Email")
        ordering = ['-is_default', 'nombre']
        constraints = [
            models.UniqueConstraint(
                fields=['is_default'],
                condition=Q(is_default=True),
                name='unique_default_email'
            ),
        ]

    def clean(self):
        """Validaciones personalizadas"""
        super().clean()
        
        # Validar puerto SMTP
        if not (1 <= self.smtp_port <= 65535):
            raise ValidationError({
                'smtp_port': _('El puerto debe estar entre 1 y 65535.')
            })
        
        # Validar que solo haya una configuración por defecto
        if self.is_default:
            existing_default = Email.objects.filter(
                is_default=True
            ).exclude(pk=self.pk).first()
            
            if existing_default:
                raise ValidationError({
                    'is_default': _('Ya existe una configuración marcada como predeterminada.')
                })

    def __str__(self):
        """Representación en string"""
        default_marker = " (Predeterminado)" if self.is_default else ""
        return f"{self.nombre} - {self.address}{default_marker}"

    def test_connection(self):
        """Prueba la conexión SMTP"""
        try:
            import smtplib
            
            if self.use_ssl:
                server = smtplib.SMTP_SSL(self.smtp_server, self.smtp_port)
            else:
                server = smtplib.SMTP(self.smtp_server, self.smtp_port)
                if self.use_tls:
                    server.starttls()
            
            server.login(self.smtp_username, self.smtp_password)
            server.quit()
            return True, _("Conexión exitosa")
            
        except Exception as e:
            return False, str(e)


class TramiteGeneral(TimeStampedModel, StatusMixin, FollowNumberMixin):
    """
    Modelo base abstracto mejorado para todos los tipos de trámites.
    
    Proporciona funcionalidad común para el sistema de gestión de trámites
    universitarios con seguimiento, estados y auditoría.
    """
    
    ESTADO_CHOICES = [
        ('BORRADOR', _('Borrador')),
        ('ENVIADO', _('Enviado')),
        ('EN_PROCESO', _('En proceso')),
        ('REQUIERE_INFO', _('Requiere información adicional')),
        ('APROBADO', _('Aprobado')),
        ('RECHAZADO', _('Rechazado')),
        ('FINALIZADO', _('Finalizado')),
        ('CANCELADO', _('Cancelado')),
    ]
    
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
        choices=ESTADO_CHOICES,
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
        indexes = [
            models.Index(fields=['usuario', 'estado_tramite']),
            models.Index(fields=['numero_seguimiento']),
            models.Index(fields=['fecha_limite']),
        ]

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
                name='estado_nombre_not_empty'
            ),
            models.CheckConstraint(
                check=Q(codigo__isnull=False) & ~Q(codigo=''),
                name='estado_codigo_not_empty'
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