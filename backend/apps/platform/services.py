"""Servicios de dominio para la app `plataforma`.
Funciones aquí deben contener la lógica de negocio y ser llamadas por vistas/serializers.
Este archivo es un esqueleto inicial para migración incremental.
"""
from django.core.mail import send_mail


def send_custom_email(subject, message, recipient_list):
    # placeholder que puede usar `plataforma.custom_mail.custom_send_mail` si se desea
    try:
        send_mail(subject=subject, message=message, from_email=None, recipient_list=recipient_list)
        return True
    except Exception:
        return False
