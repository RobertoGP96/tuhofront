
from atention.models import validate_file_extension
from platform.enums import NewsCategoryEnum
from platform.validators import validate_file_size
from platform.models import models
from backend.apps.platform.models.base_models import StatusMixin
from .base_models import TimeStampedModel
from django.utils.translation import gettext_lazy as _
from django.db.models import Q

class Noticias(TimeStampedModel, StatusMixin):
    """
    Modelo mejorado para noticias del sistema universitario.
    
    Gestiona las noticias y anuncios que se publican en la plataforma,
    con soporte para imágenes, categorización y programación de publicación.
    """
    title = models.CharField(
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
    
    category = models.CharField(
        max_length=20,
        choices=NewsCategoryEnum,
        default='GENERAL',
        verbose_name=_("Categoría"),
        help_text=_("Categoría de la noticia")
    )
    
    header_image = models.ImageField(
        upload_to=get_news_upload_path,
        blank=True,
        null=True,
        validators=[validate_file_extension, validate_file_size],
        verbose_name=_("Imagen de cabecera"),
        help_text=_("Imagen principal de la noticia (opcional)")
    )
    
    summary = models.CharField(
        max_length=300,
        blank=True,
        null=True,
        verbose_name=_("Resumen"),
        help_text=_("Breve resumen de la noticia (máximo 300 caracteres)")
    )
    
    body = models.TextField(
        verbose_name=_("Contenido"),
        help_text=_("Contenido completo de la noticia")
    )
    
    author = models.ForeignKey(
        'usuarios.Usuario',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='noticias_creadas',
        verbose_name=_("Autor"),
        help_text=_("Usuario que creó la noticia")
    )

    is_published = models.BooleanField(
        default=False,
        verbose_name=_("Publicado"),
        help_text=_("Indica si la noticia está publicada")
    )
    
    publication_date = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name=_("Fecha de publicación"),
        help_text=_("Fecha programada para publicar la noticia")
    )

    featured = models.BooleanField(
        default=False,
        verbose_name=_("Destacada"),
        help_text=_("Indica si la noticia debe aparecer destacada")
    )
    
    tags = models.CharField(
        max_length=255,
        blank=True,
        verbose_name=_("Etiquetas"),
        help_text=_("Etiquetas separadas por comas para facilitar búsquedas")
    )
    
    class Meta:
        verbose_name = _("Noticia")
        verbose_name_plural = _("Noticias")
        ordering = ['-publication_date', '-created_at']
        indexes = [
            models.Index(fields=['is_published', 'publication_date']),
            models.Index(fields=['category', 'is_published']),
            models.Index(fields=['featured', 'is_published']),
            models.Index(fields=['slug']),
        ]
        constraints = [
            models.CheckConstraint(
                check=Q(title__isnull=False) & ~Q(title=''),
                name='noticias_titulo_not_empty'
            ),
            models.CheckConstraint(
                check=Q(body__isnull=False) & ~Q(body=''),
                name='noticias_cuerpo_not_empty'
            ),
        ]

    def clean(self):
        """Validaciones personalizadas"""
        super().clean()

    def save(self, *args, **kwargs):
        """Sobrescribe save para lógica personalizada"""
        # Generar slug automáticamente si no existe
        if not self.slug:
            from django.utils.text import slugify
            base_slug = slugify(self.title)
            slug = base_slug
            counter = 1
            
            while Noticias.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
            
            self.slug = slug
        
        # Ejecutar validaciones
        self.full_clean()
        
        # Establecer fecha de publicación si se marca como publicado
        if self.is_published and not self.publication_date:
            from django.utils import timezone
            self.publication_date = timezone.now()
        
        super().save(*args, **kwargs)

    def __str__(self):
        """Representación en string"""
        status = "📰" if self.is_published else "📝"
        featured = "⭐" if self.featured else ""
        return f"{status}{featured} {self.title}"

    @property
    def is_published(self):
        """Verifica si la noticia está publicada y activa"""
        return self.is_published and self.is_active

    @property
    def can_be_published(self):
        """Verifica si la noticia puede ser publicada"""
        return bool(self.title and self.body and self.is_active)

