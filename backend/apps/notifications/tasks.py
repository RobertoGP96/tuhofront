"""
Tareas Celery para envío de emails de forma asíncrona.

Si Celery no está disponible, el decorador shared_task se degrada a una
función normal y se ejecuta en línea (con settings.CELERY_TASK_ALWAYS_EAGER=True).
"""
from __future__ import annotations

import logging

from django.conf import settings

logger = logging.getLogger(__name__)


try:
    from celery import shared_task
except ImportError:  # pragma: no cover
    def shared_task(*args, **kwargs):  # type: ignore[misc]
        def decorator(fn):
            fn.delay = lambda *a, **kw: fn(*a, **kw)
            return fn
        return decorator


@shared_task(
    bind=True,
    autoretry_for=(Exception,),
    retry_backoff=True,
    retry_kwargs={'max_retries': 3},
)
def send_email_task(self, *, to: str, subject: str, body: str, template: str | None = None, context: dict | None = None):
    """Envía un email (plain + HTML si hay template)."""
    from django.core.mail import EmailMultiAlternatives
    from django.template.loader import render_to_string
    from django.utils.html import strip_tags

    context = context or {}
    html_content = None
    if template:
        try:
            html_content = render_to_string(template, context)
        except Exception as exc:  # noqa: BLE001
            logger.warning('No se pudo renderizar template %s: %s', template, exc)

    text_body = strip_tags(html_content) if html_content else body
    msg = EmailMultiAlternatives(
        subject=subject,
        body=text_body,
        from_email=getattr(settings, 'DEFAULT_FROM_EMAIL', None),
        to=[to],
    )
    if html_content:
        msg.attach_alternative(html_content, 'text/html')
    msg.send(fail_silently=False)
    return True
