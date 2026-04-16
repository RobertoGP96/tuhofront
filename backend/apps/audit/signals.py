"""
Signal handlers globales de auditoría: login/logout exitoso y fallido.
"""
from django.contrib.auth.signals import (
    user_logged_in,
    user_logged_out,
    user_login_failed,
)
from django.dispatch import receiver

from .services import log_event


@receiver(user_logged_in)
def _on_login(sender, request, user, **kwargs):
    log_event(action='login', user=user, description=f'Inicio de sesión de {user}')


@receiver(user_logged_out)
def _on_logout(sender, request, user, **kwargs):
    if user:
        log_event(action='logout', user=user, description=f'Cierre de sesión de {user}')


@receiver(user_login_failed)
def _on_login_failed(sender, credentials, request, **kwargs):
    username = credentials.get('username') if credentials else None
    log_event(
        action='login_failed',
        description=f'Intento fallido de login: {username}',
        metadata={'username': username},
    )
