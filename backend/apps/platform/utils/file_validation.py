"""
Validación robusta de archivos subidos por usuarios.

- Verifica tipo MIME real (usa python-magic cuando esté disponible, fallback por extensión).
- Limita tamaño máximo.
- Puede usarse como `validators` de un FileField o llamarse manualmente.
"""
from __future__ import annotations

import os
from typing import Iterable

from django.conf import settings
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _

# Mapeo de extensiones a MIME por fallback
_EXT_MIME_FALLBACK = {
    '.pdf': 'application/pdf',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.webp': 'image/webp',
    '.doc': 'application/msword',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.xls': 'application/vnd.ms-excel',
    '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
}


def _detect_mime(file_obj) -> str:
    """Intenta detectar el MIME real del archivo."""
    # Intento con python-magic
    try:
        import magic  # type: ignore
        file_obj.seek(0)
        head = file_obj.read(2048)
        file_obj.seek(0)
        mime = magic.from_buffer(head, mime=True)
        if mime:
            return mime
    except Exception:  # noqa: BLE001
        pass

    # Fallback por extensión
    name = getattr(file_obj, 'name', '') or ''
    ext = os.path.splitext(name)[1].lower()
    return _EXT_MIME_FALLBACK.get(ext, 'application/octet-stream')


def validate_uploaded_file(
    file_obj,
    *,
    allowed_mime_types: Iterable[str] | None = None,
    max_size_bytes: int | None = None,
) -> None:
    """Valida tamaño y tipo MIME real. Levanta ValidationError si falla.

    Defaults pulled from settings.ALLOWED_UPLOAD_MIME_TYPES y
    settings.FILE_UPLOAD_MAX_MEMORY_SIZE.
    """
    if file_obj is None:
        return

    max_size = max_size_bytes or getattr(settings, 'FILE_UPLOAD_MAX_MEMORY_SIZE', 10 * 1024 * 1024)
    size = getattr(file_obj, 'size', 0) or 0
    if size > max_size:
        raise ValidationError(
            _('El archivo excede el tamaño máximo permitido (%(max)d MB).'),
            params={'max': max_size // (1024 * 1024)},
        )

    allowed = list(allowed_mime_types or getattr(settings, 'ALLOWED_UPLOAD_MIME_TYPES', []))
    if not allowed:
        return

    mime = _detect_mime(file_obj)
    if mime not in allowed:
        raise ValidationError(
            _('Tipo de archivo no permitido: %(mime)s'),
            params={'mime': mime},
        )


class AllowedMimeValidator:
    """Validator reutilizable en FileField(validators=[...])."""

    def __init__(self, allowed: Iterable[str] | None = None, max_size: int | None = None):
        self.allowed = list(allowed) if allowed else None
        self.max_size = max_size

    def __call__(self, value):
        validate_uploaded_file(value, allowed_mime_types=self.allowed, max_size_bytes=self.max_size)

    def deconstruct(self):
        return (
            'apps.platform.utils.file_validation.AllowedMimeValidator',
            [],
            {'allowed': self.allowed, 'max_size': self.max_size},
        )
