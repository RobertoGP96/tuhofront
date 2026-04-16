"""
Modelo de documento oficial generado (PDF).

Guarda la referencia al trámite origen, el código de verificación único (para
consulta pública del QR), el archivo PDF generado y el usuario que lo emitió.
"""
import secrets
from django.conf import settings
from django.db import models
from django.utils.translation import gettext_lazy as _


def _gen_verification_code() -> str:
    """Genera un código alfanumérico de 16 caracteres en mayúsculas."""
    return secrets.token_urlsafe(12).replace('-', '').replace('_', '')[:16].upper()


class OfficialDocument(models.Model):
    """
    Documento oficial emitido (constancia, certificado, reserva aprobada, etc.).
    El PDF es la salida canónica y verificable.
    """

    class DocType(models.TextChoices):
        PROCEDURE = 'procedure', _('Constancia de trámite')
        RESERVATION = 'reservation', _('Confirmación de reserva')
        CERTIFICATE = 'certificate', _('Certificado académico')
        OTHER = 'other', _('Otro')

    resource_type = models.CharField(
        max_length=100,
        verbose_name=_('Tipo de recurso origen'),
        help_text=_('Ej: labs.LocalReservation, internal.FeedingProcedure'),
    )
    resource_id = models.CharField(
        max_length=64,
        verbose_name=_('ID del recurso origen'),
    )

    doc_type = models.CharField(
        max_length=20,
        choices=DocType.choices,
        default=DocType.PROCEDURE,
    )

    verification_code = models.CharField(
        max_length=32,
        unique=True,
        default=_gen_verification_code,
        db_index=True,
        verbose_name=_('Código de verificación'),
        help_text=_('Código único para verificar la autenticidad del documento vía QR'),
    )

    file = models.FileField(
        upload_to='documents/official/%Y/%m/',
        verbose_name=_('Archivo PDF'),
    )

    issued_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='issued_documents',
        verbose_name=_('Emitido por'),
    )
    issued_to = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='received_documents',
        verbose_name=_('Emitido para'),
    )

    title = models.CharField(
        max_length=255,
        verbose_name=_('Título'),
    )

    metadata = models.JSONField(default=dict, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(null=True, blank=True, verbose_name=_('Expira en'))

    revoked = models.BooleanField(default=False, verbose_name=_('Revocado'))
    revoked_reason = models.CharField(max_length=255, blank=True)
    revoked_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        app_label = 'documents'
        verbose_name = _('Documento oficial')
        verbose_name_plural = _('Documentos oficiales')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['resource_type', 'resource_id']),
            models.Index(fields=['issued_to', '-created_at']),
        ]

    def __str__(self) -> str:
        return f'{self.title} · {self.verification_code}'
