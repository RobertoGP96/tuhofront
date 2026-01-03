import secrets
import string
from django.core.mail import send_mail
from django.conf import settings
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from typing import Optional


def generate_secure_token(length: int = 32) -> str:
    """
    Genera un token seguro para activación o reseteo de contraseña.
    
    Args:
        length: Longitud del token
        
    Returns:
        Token seguro URL-safe
    """
    return secrets.token_urlsafe(length)


def generate_verification_code(length: int = 6) -> str:
    """
    Genera un código de verificación numérico.
    
    Args:
        length: Longitud del código
        
    Returns:
        Código numérico como string
    """
    return ''.join(secrets.choice(string.digits) for _ in range(length))


def send_activation_email(user, token: str) -> bool:
    """
    Envía email de activación de cuenta.
    
    Args:
        user: Instancia del usuario
        token: Token de activación
        
    Returns:
        True si el email fue enviado exitosamente
    """
    try:
        subject = 'Activa tu cuenta - Sistema Universitario'
        
        # URL de activación (ajustar según configuración)
        activation_url = f"{settings.FRONTEND_URL}/activate/{token}"
        
        context = {
            'user': user,
            'activation_url': activation_url,
            'token': token
        }
        
        # Renderizar templates
        html_message = render_to_string('emails/activation_email.html', context)
        plain_message = render_to_string('emails/activation_email.txt', context)
        
        send_mail(
            subject=subject,
            message=plain_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            html_message=html_message,
            fail_silently=False,
        )
        
        return True
    except Exception as e:
        # Log del error
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Error enviando email de activación a {user.email}: {e}")
        return False


def send_password_reset_email(user, token: str) -> bool:
    """
    Envía email de reseteo de contraseña.
    
    Args:
        user: Instancia del usuario
        token: Token de reseteo
        
    Returns:
        True si el email fue enviado exitosamente
    """
    try:
        subject = 'Recupera tu contraseña - Sistema Universitario'
        
        # URL de reseteo (ajustar según configuración)
        reset_url = f"{settings.FRONTEND_URL}/reset-password/{token}"
        
        context = {
            'user': user,
            'reset_url': reset_url,
            'token': token
        }
        
        # Renderizar templates
        html_message = render_to_string('emails/password_reset_email.html', context)
        plain_message = render_to_string('emails/password_reset_email.txt', context)
        
        send_mail(
            subject=subject,
            message=plain_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            html_message=html_message,
            fail_silently=False,
        )
        
        return True
    except Exception as e:
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Error enviando email de reseteo a {user.email}: {e}")
        return False


def send_welcome_email(user) -> bool:
    """
    Envía email de bienvenida después de activar la cuenta.
    
    Args:
        user: Instancia del usuario
        
    Returns:
        True si el email fue enviado exitosamente
    """
    try:
        subject = '¡Bienvenido al Sistema Universitario!'
        
        # URL del dashboard
        dashboard_url = f"{settings.FRONTEND_URL}/dashboard"
        
        context = {
            'user': user,
            'dashboard_url': dashboard_url
        }
        
        # Renderizar templates
        html_message = render_to_string('emails/welcome_email.html', context)
        plain_message = render_to_string('emails/welcome_email.txt', context)
        
        send_mail(
            subject=subject,
            message=plain_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            html_message=html_message,
            fail_silently=False,
        )
        
        return True
    except Exception as e:
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Error enviando email de bienvenida a {user.email}: {e}")
        return False


def send_verification_code_sms(user, code: str) -> bool:
    """
    Envía código de verificación por SMS.
    
    Args:
        user: Instancia del usuario
        code: Código de verificación
        
    Returns:
        True si el SMS fue enviado exitosamente
    """
    try:
        # Implementar integración con servicio SMS
        # Ejemplo con Twilio, Nexmo, etc.
        
        phone = user.phone
        message = f"Tu código de verificación es: {code}"
        
        # TODO: Implementar envío real de SMS
        print(f"SMS a {phone}: {message}")
        
        return True
    except Exception as e:
        print(f"Error enviando SMS: {e}")
        return False


def validate_carnet_format(carnet: str) -> bool:
    """
    Valida el formato del carnet de identidad cubano.
    
    Args:
        carnet: Carnet de identidad
        
    Returns:
        True si el formato es válido
    """
    if not carnet or len(carnet) != 11:
        return False
    
    if not carnet.isdigit():
        return False
    
    # Validar año de nacimiento (primeros 2 dígitos)
    year = int(carnet[:2])
    if year < 0 or year > 99:
        return False
    
    # Validar mes (caracteres 3-4)
    month = int(carnet[2:4])
    if month < 1 or month > 12:
        return False
    
    # Validar día (caracteres 5-6)
    day = int(carnet[4:6])
    if day < 1 or day > 31:
        return False
    
    return True


def calculate_age_from_carnet(carnet: str) -> Optional[int]:
    """
    Calcula la edad a partir del carnet de identidad.
    
    Args:
        carnet: Carnet de identidad
        
    Returns:
        Edad calculada o None si no es posible calcular
    """
    if not validate_carnet_format(carnet):
        return None
    
    from datetime import date
    
    # Extraer fecha de nacimiento del carnet
    year = int(carnet[:2])
    month = int(carnet[2:4])
    day = int(carnet[4:6])
    
    # Determinar siglo (asumiendo personas nacidas después de 1900)
    current_year = date.today().year
    century = 1900 if year > (current_year % 100) else 2000
    full_year = century + year
    
    try:
        birth_date = date(full_year, month, day)
        today = date.today()
        age = today.year - birth_date.year - (
            (today.month, today.day) < (birth_date.month, birth_date.day)
        )
        return age
    except ValueError:
        return None


def format_phone_number(phone: str) -> str:
    """
    Formatea número de teléfono cubano.
    
    Args:
        phone: Número de teléfono
        
    Returns:
        Número formateado
    """
    # Remover espacios y caracteres especiales
    phone = ''.join(filter(str.isdigit, phone))
    
    # Formato: 5XXX-XXXX para móviles, XXXX-XXXX para fijos
    if len(phone) == 8:
        return f"{phone[:4]}-{phone[4:]}"
    
    return phone


def mask_email(email: str) -> str:
    """
    Enmascara un email para mostrar parcialmente.
    
    Args:
        email: Email a enmascarar
        
    Returns:
        Email enmascarado
    """
    if not email or '@' not in email:
        return email
    
    username, domain = email.split('@')
    
    if len(username) <= 2:
        masked_username = username[0] + '*'
    else:
        masked_username = username[0] + '*' * (len(username) - 2) + username[-1]
    
    return f"{masked_username}@{domain}"


def generate_username_from_name(first_name: str, last_name: str) -> str:
    """
    Genera un username a partir del nombre y apellido.
    
    Args:
        first_name: Nombre
        last_name: Apellido
        
    Returns:
        Username generado
    """
    from django.utils.text import slugify
    
    # Crear username base
    base_username = slugify(f"{first_name}.{last_name}").replace('-', '.')
    
    # Si ya existe, agregar número
    from models.user import User
    username = base_username
    counter = 1

    while User.objects.filter(username=username).exists():
        username = f"{base_username}{counter}"
        counter += 1
    
    return username


def get_user_statistics():
    """
    Obtiene estadísticas generales de usuarios.
    
    Returns:
        Diccionario con estadísticas
    """
    from django.db.models import Count, Q
    from datetime import datetime, timedelta
    from models.user import User
    
    total_users = User.objects.count()
    active_users = User.objects.filter(is_active=True).count()
    
    # Usuarios verificados
    verified_users = User.objects.filter(
        email_verified=True,
        phone_verified=True
    ).count()
    
    # Usuarios por tipo
    users_by_type = dict(
        User.objects.values('user_type').annotate(
            count=Count('id')
        ).values_list('user_type', 'count')
    )
    
    # Registros recientes
    thirty_days_ago = datetime.now() - timedelta(days=30)
    recent_registrations = User.objects.filter(
        date_joined__gte=thirty_days_ago
    ).count()
    
    # Usuarios activos en los últimos 7 días
    seven_days_ago = datetime.now() - timedelta(days=7)
    recently_active = User.objects.filter(
        last_login__gte=seven_days_ago
    ).count()
    
    return {
        'total_users': total_users,
        'active_users': active_users,
        'inactive_users': total_users - active_users,
        'verified_users': verified_users,
        'users_by_type': users_by_type,
        'recent_registrations': recent_registrations,
        'recently_active': recently_active
    }