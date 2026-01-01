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
        
        """
Validadores personalizados para la aplicación de usuarios
"""
import re
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _


def validate_carnet_identidad(value):
    """
    Valida que el carnet de identidad tenga el formato correcto cubano
    Formato: 11 dígitos, donde los primeros 6 representan la fecha de nacimiento
    """
    if not value:
        return
    
    # Eliminar espacios y verificar que solo contenga dígitos
    carnet = re.sub(r'\s+', '', str(value))
    
    if not carnet.isdigit():
        raise ValidationError(
            _('El carnet de identidad debe contener solo números'),
            code='invalid_carnet_format'
        )
    
    if len(carnet) != 11:
        raise ValidationError(
            _('El carnet de identidad debe tener exactamente 11 dígitos'),
            code='invalid_carnet_length'
        )
    
    # Validar que los primeros 6 dígitos formen una fecha válida
    try:
        year_suffix = int(carnet[:2])
        month = int(carnet[2:4])
        day = int(carnet[4:6])
        
        # Verificar mes válido
        if month < 1 or month > 12:
            raise ValidationError(
                _('El mes en el carnet de identidad no es válido'),
                code='invalid_carnet_month'
            )
        
        # Verificar día válido (simplificado)
        if day < 1 or day > 31:
            raise ValidationError(
                _('El día en el carnet de identidad no es válido'),
                code='invalid_carnet_day'
            )
            
        # Para años 00-30 asumimos 2000-2030, para 31-99 asumimos 1931-1999
        current_year = 2025  # Año actual
        if year_suffix <= 30:
            full_year = 2000 + year_suffix
        else:
            full_year = 1900 + year_suffix
            
        # Verificar que la persona tenga una edad razonable (entre 16 y 100 años)
        age = current_year - full_year
        if age < 16 or age > 100:
            raise ValidationError(
                _('La fecha de nacimiento en el carnet indica una edad no válida'),
                code='invalid_carnet_age'
            )
            
    except ValueError:
        raise ValidationError(
            _('Los primeros 6 dígitos del carnet deben formar una fecha válida (AAMMDD)'),
            code='invalid_carnet_date_format'
        )


def validate_telefono_cuba(value):
    """
    Valida que el teléfono tenga un formato válido cubano
    Acepta: 8 dígitos fijos, móviles (5XXXXXXX), provinciales
    """
    if not value:
        return
    
    # Limpiar el número (remover espacios, guiones, paréntesis)
    telefono = re.sub(r'[\s\-\(\)\+]', '', str(value))
    
    # Verificar que solo contenga dígitos
    if not telefono.isdigit():
        raise ValidationError(
            _('El teléfono debe contener solo números'),
            code='invalid_phone_format'
        )
    
    # Verificar longitud
    if len(telefono) != 8:
        raise ValidationError(
            _('El teléfono debe tener exactamente 8 dígitos'),
            code='invalid_phone_length'
        )
    
    # Validar prefijos conocidos para Cuba
    valid_prefixes = [
        # Móviles
        '5', '53', '54', '55', '56', '57', '58', '59',
        # Fijos La Habana
        '7', '72', '76', '78',
        # Otros provinciales
        '2', '3', '4', '6', '8'
    ]
    
    # Verificar que comience con un prefijo válido
    starts_with_valid = any(telefono.startswith(prefix) for prefix in valid_prefixes)
    
    if not starts_with_valid:
        raise ValidationError(
            _('El número de teléfono no tiene un prefijo válido para Cuba'),
            code='invalid_phone_prefix'
        )


def validate_token_activacion(value):
    """
    Valida que el token de activación tenga un formato válido
    """
    if not value:
        return
    
    if len(value) < 20:
        raise ValidationError(
            _('El token de activación debe tener al menos 20 caracteres'),
            code='invalid_token_length'
        )
    
    # Verificar que contenga solo caracteres alfanuméricos y algunos especiales
    if not re.match(r'^[a-zA-Z0-9\-_\.]+$', value):
        raise ValidationError(
            _('El token de activación contiene caracteres no válidos'),
            code='invalid_token_format'
        )