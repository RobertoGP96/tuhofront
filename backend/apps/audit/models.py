"""
Audit log centralizado.

Registra toda acción relevante del sistema (cambios de estado de trámites,
login/logout, modificaciones administrativas, accesos a recursos sensibles).
"""
from django.conf import settings
from django.db import models
from django.utils.translation import gettext_lazy as _


class AuditActionChoices(models.TextChoices):
    CREATE = 'create', _('Creación')
    UPDATE = 'update', _('Actualización')
    DELETE = 'delete', _('Eliminación')
    STATE_CHANGE = 'state_change', _('Cambio de estado')
    LOGIN = 'login', _('Inicio de sesión')
    LOGIN_FAILED = 'login_failed', _('Login fallido')
    LOGOUT = 'logout', _('Cierre de sesión')
    PASSWORD_RESET = 'password_reset', _('Restablecimiento de contraseña')
    PERMISSION_CHANGE = 'permission_change', _('Cambio de permisos')
    USER_ACTIVATION = 'user_activation', _('Activación de usuario')
    USER_DEACTIVATION = 'user_deactivation', _('Desactivación de usuario')
    APPROVE = 'approve', _('Aprobación')
    REJECT = 'reject', _('Rechazo')
    CANCEL = 'cancel', _('Cancelación')
    CHECK_IN = 'check_in', _('Check-in')
    CHECK_OUT = 'check_out', _('Check-out')
    EXPORT = 'export', _('Exportación')
    DOCUMENT_GENERATED = 'document_generated', _('Documento generado')
    OTHER = 'other', _('Otro')


class AuditLog(models.Model):
    """
    Entrada genérica de bitácora.

    No usa FK dura al recurso para que pueda apuntar a cualquier modelo
    (resource_type = "labs.LocalReservation", resource_id = "42").
    """

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='audit_logs',
        verbose_name=_('Usuario'),
        help_text=_('Usuario que ejecutó la acción (null si anónimo/sistema)'),
    )

    action = models.CharField(
        max_length=32,
        choices=AuditActionChoices.choices,
        verbose_name=_('Acción'),
    )

    resource_type = models.CharField(
        max_length=100,
        blank=True,
        verbose_name=_('Tipo de recurso'),
        help_text=_('Ej: labs.LocalReservation, platform.User'),
    )

    resource_id = models.CharField(
        max_length=64,
        blank=True,
        verbose_name=_('ID del recurso'),
    )

    description = models.TextField(
        blank=True,
        verbose_name=_('Descripción'),
    )

    metadata = models.JSONField(
        default=dict,
        blank=True,
        verbose_name=_('Metadatos'),
        help_text=_('Información adicional (diff, estados, context)'),
    )

    ip_address = models.GenericIPAddressField(
        null=True,
        blank=True,
        verbose_name=_('Dirección IP'),
    )

    user_agent = models.CharField(
        max_length=500,
        blank=True,
        verbose_name=_('User-Agent'),
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
        db_index=True,
        verbose_name=_('Fecha'),
    )

    class Meta:
        app_label = 'audit'
        verbose_name = _('Entrada de auditoría')
        verbose_name_plural = _('Bitácora de auditoría')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['resource_type', 'resource_id']),
            models.Index(fields=['user', '-created_at']),
            models.Index(fields=['action', '-created_at']),
        ]

    def __str__(self) -> str:
        who = getattr(self.user, 'username', None) or 'sistema'
        return f"[{self.created_at:%Y-%m-%d %H:%M}] {who} · {self.get_action_display()} · {self.resource_type}:{self.resource_id}"
