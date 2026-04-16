"""
Configuración del sistema editable en runtime.

Mantiene un registro singleton con opciones institucionales que pueden cambiar
sin redeploy: nombre institución, horarios permitidos de reserva, duración
mínima/máxima, restricciones por rol, etc.
"""
from django.core.cache import cache
from django.db import models
from django.utils.translation import gettext_lazy as _


SETTINGS_CACHE_KEY = 'tuho:system_settings'
SETTINGS_CACHE_TTL = 300  # 5 min


class SystemSettings(models.Model):
    """Singleton con configuración institucional editable en runtime."""

    # Institucional
    institution_name = models.CharField(max_length=200, default='Universidad de Holguín')
    institution_short_name = models.CharField(max_length=50, default='UHo')
    institution_address = models.CharField(max_length=300, blank=True)
    institution_website = models.URLField(blank=True)
    institution_logo = models.ImageField(upload_to='settings/', null=True, blank=True)
    support_email = models.EmailField(blank=True)

    # Reservas
    reservation_min_minutes = models.PositiveIntegerField(
        default=30,
        help_text=_('Duración mínima (minutos) de una reserva'),
    )
    reservation_max_minutes = models.PositiveIntegerField(
        default=8 * 60,
        help_text=_('Duración máxima (minutos) de una reserva'),
    )
    reservation_open_hour = models.PositiveSmallIntegerField(
        default=7,
        help_text=_('Hora de apertura para reservas (0-23)'),
    )
    reservation_close_hour = models.PositiveSmallIntegerField(
        default=21,
        help_text=_('Hora de cierre para reservas (0-23)'),
    )
    reservation_advance_days = models.PositiveSmallIntegerField(
        default=90,
        help_text=_('Máximo de días en el futuro para reservar'),
    )

    # Módulos activos
    module_internal_enabled = models.BooleanField(default=True)
    module_secretary_enabled = models.BooleanField(default=True)
    module_labs_enabled = models.BooleanField(default=True)
    module_news_enabled = models.BooleanField(default=True)

    # Firma/Emisión
    signature_enabled = models.BooleanField(default=False)
    qr_verification_enabled = models.BooleanField(default=True)

    # Audit
    updated_at = models.DateTimeField(auto_now=True)
    updated_by = models.ForeignKey(
        'platform.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='+',
    )

    class Meta:
        app_label = 'settings_runtime'
        verbose_name = _('Configuración del sistema')
        verbose_name_plural = _('Configuración del sistema')

    def __str__(self) -> str:
        return f'Configuración TUho · {self.institution_name}'

    def save(self, *args, **kwargs):
        # Singleton: siempre pk=1
        self.pk = 1
        super().save(*args, **kwargs)
        cache.set(SETTINGS_CACHE_KEY, self, SETTINGS_CACHE_TTL)

    @classmethod
    def load(cls) -> 'SystemSettings':
        cached = cache.get(SETTINGS_CACHE_KEY)
        if cached is not None:
            return cached
        obj, _ = cls.objects.get_or_create(pk=1)
        cache.set(SETTINGS_CACHE_KEY, obj, SETTINGS_CACHE_TTL)
        return obj
