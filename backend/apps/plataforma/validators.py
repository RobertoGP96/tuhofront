"""
Validadores personalizados para archivos y otros campos de la plataforma
"""
import os
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _
from django.conf import settings


def validate_file_extension(value):
    """
    Validador mejorado para extensiones de archivo
    """
    if not value:
        return
    
    ext = os.path.splitext(value.name)[1].lower()
    valid_extensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp']
    
    if ext not in valid_extensions:
        raise ValidationError(
            _('Formato de archivo no soportado. Formatos permitidos: %(extensions)s'),
            code='invalid_extension',
            params={'extensions': ', '.join(valid_extensions)}
        )


def validate_document_extension(value):
    """
    Validador para documentos (más permisivo)
    """
    if not value:
        return
    
    ext = os.path.splitext(value.name)[1].lower()
    valid_extensions = [
        '.pdf', '.doc', '.docx', '.txt', '.rtf',
        '.jpg', '.jpeg', '.png', '.gif',
        '.xlsx', '.xls', '.csv',
        '.zip', '.rar'
    ]
    
    if ext not in valid_extensions:
        raise ValidationError(
            _('Formato de documento no soportado. Formatos permitidos: %(extensions)s'),
            code='invalid_document_extension',
            params={'extensions': ', '.join(valid_extensions)}
        )


def validate_file_size(value):
    """
    Validador de tamaño de archivo
    """
    if not value:
        return
    
    max_size = getattr(settings, 'MAX_UPLOAD_SIZE', 10 * 1024 * 1024)  # 10MB por defecto
    
    if value.size > max_size:
        raise ValidationError(
            _('El archivo es demasiado grande. Tamaño máximo permitido: %(max_size)s MB'),
            code='file_too_large',
            params={'max_size': max_size // (1024 * 1024)}
        )


def validate_image_dimensions(value):
    """
    Validador de dimensiones de imagen
    """
    if not value:
        return
    
    try:
        from PIL import Image
        img = Image.open(value)
        width, height = img.size
        
        max_width = getattr(settings, 'MAX_IMAGE_WIDTH', 2048)
        max_height = getattr(settings, 'MAX_IMAGE_HEIGHT', 2048)
        
        if width > max_width or height > max_height:
            raise ValidationError(
                _('Las dimensiones de la imagen son demasiado grandes. '
                  'Máximo permitido: %(max_width)sx%(max_height)s pixels'),
                code='image_too_large',
                params={'max_width': max_width, 'max_height': max_height}
            )
            
    except Exception:
        raise ValidationError(
            _('No se pudo procesar la imagen. Asegúrese de que sea un archivo de imagen válido.'),
            code='invalid_image'
        )