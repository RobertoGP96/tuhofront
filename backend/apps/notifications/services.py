"""
Servicio unificado de notificaciones.

Puntos de entrada:
- `notify(user, ...)` — crea una Notificacion en BD y (opcionalmente) envía email.
- `notify_many(users, ...)` — envía a múltiples usuarios.
- `notify_state_change(procedure, old_state, new_state, actor=None)` — helper para
  trámites/reservas que cambian de estado.

Los emails se envían vía Celery (tarea `send_email_task`). Si `CELERY_TASK_ALWAYS_EAGER=True`
(por defecto en DEBUG), el envío es síncrono.
"""
from __future__ import annotations

import logging
from typing import Iterable

from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils.html import strip_tags

from .models import Notificacion

logger = logging.getLogger(__name__)


# ------------------------------------------------------------
# Core
# ------------------------------------------------------------

def notify(
    user,
    *,
    subject: str,
    body: str,
    tipo: str = 'INFO',
    prioridad: str = 'MEDIUM',
    from_user=None,
    url_accion: str | None = None,
    extra: dict | None = None,
    send_email: bool = True,
    email_template: str | None = None,
    email_context: dict | None = None,
) -> Notificacion | None:
    """Crea una Notificacion en BD y (opcionalmente) envía email.

    Retorna la Notificacion o None si el user es inválido.
    """
    if user is None or not getattr(user, 'pk', None):
        logger.warning('notify: usuario inválido, se omite')
        return None

    try:
        notif = Notificacion.objects.create(
            tipo=tipo,
            prioridad=prioridad,
            asunto=subject[:255],
            cuerpo=body,
            para=user,
            de=from_user,
            url_accion=url_accion,
            datos_adicionales=extra or {},
        )
    except Exception as exc:  # noqa: BLE001
        logger.exception('Error creando Notificacion: %s', exc)
        notif = None

    if send_email and getattr(user, 'email', None):
        _enqueue_email(
            to=user.email,
            subject=subject,
            body=body,
            template=email_template,
            context=email_context or {},
        )

    return notif


def notify_many(users: Iterable, **kwargs) -> list[Notificacion]:
    results = []
    for user in users:
        n = notify(user, **kwargs)
        if n is not None:
            results.append(n)
    return results


def notify_state_change(procedure, *, old_state: str | None, new_state: str, actor=None, reason: str = '') -> None:
    """Helper para notificar cambios de estado de un trámite o reserva.

    Llamado desde signals post_save. Notifica al `created_by`/`user` del trámite.
    """
    target_user = _get_procedure_target_user(procedure)
    if target_user is None:
        return

    resource_name = procedure.__class__.__name__
    subject = f'Actualización de tu {resource_name}'
    body_parts = [
        f'Tu {resource_name} (#{procedure.pk}) cambió de estado.',
    ]
    if old_state:
        body_parts.append(f'Estado anterior: {old_state}')
    body_parts.append(f'Estado actual: {new_state}')
    if reason:
        body_parts.append(f'Motivo: {reason}')

    action_url = _build_action_url(procedure)
    priority = 'HIGH' if new_state.upper() in ('RECHAZADO', 'RECHAZADA', 'CANCELADO', 'CANCELADA') else 'MEDIUM'

    notify(
        target_user,
        subject=subject,
        body='\n'.join(body_parts),
        tipo='PROCEDURE',
        prioridad=priority,
        from_user=actor,
        url_accion=action_url,
        extra={
            'procedure_id': procedure.pk,
            'resource_type': f'{procedure._meta.app_label}.{procedure._meta.object_name}',
            'old_state': old_state,
            'new_state': new_state,
            'reason': reason,
        },
        email_template='emails/state_change.html',
        email_context={
            'user': target_user,
            'procedure': procedure,
            'resource_name': resource_name,
            'old_state': old_state,
            'new_state': new_state,
            'reason': reason,
            'action_url': action_url,
        },
    )


# ------------------------------------------------------------
# Email helpers
# ------------------------------------------------------------

def _enqueue_email(*, to: str, subject: str, body: str, template: str | None, context: dict) -> None:
    """Encola el envío del email vía Celery (o lo ejecuta inline si EAGER)."""
    try:
        from .tasks import send_email_task  # import local para evitar ciclo
        send_email_task.delay(
            to=to,
            subject=subject,
            body=body,
            template=template,
            context=_serializable_context(context),
        )
    except Exception as exc:  # noqa: BLE001
        logger.warning('No se pudo encolar email (fallback a síncrono): %s', exc)
        _send_email_sync(to=to, subject=subject, body=body, template=template, context=context)


def _send_email_sync(*, to: str, subject: str, body: str, template: str | None, context: dict) -> None:
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
    try:
        msg.send(fail_silently=False)
    except Exception as exc:  # noqa: BLE001
        logger.exception('Error enviando email a %s: %s', to, exc)


def _serializable_context(context: dict) -> dict:
    """Convierte un contexto a algo serializable JSON (para pasar a Celery)."""
    safe = {}
    for key, value in context.items():
        try:
            import json
            json.dumps(value, default=str)
            safe[key] = value
        except (TypeError, ValueError):
            safe[key] = str(value)
    return safe


# ------------------------------------------------------------
# Helpers para introspección de Procedure
# ------------------------------------------------------------

def _get_procedure_target_user(procedure):
    for attr in ('created_by', 'user', 'requester', 'solicitante'):
        u = getattr(procedure, attr, None)
        if u is not None:
            return u
    return None


def _build_action_url(procedure) -> str:
    frontend = getattr(settings, 'FRONTEND_URL', '').rstrip('/')
    app_label = procedure._meta.app_label
    mapping = {
        'labs': f'{frontend}/my-reservations',
        'internal': f'{frontend}/procedures/internals',
        'secretary_doc': f'{frontend}/procedures',
        'platform': f'{frontend}/procedures',
    }
    return mapping.get(app_label, frontend or '')


# ------------------------------------------------------------
# Compatibilidad hacia atrás
# ------------------------------------------------------------

def enqueue_notification(payload: dict) -> bool:
    """API legacy — mantiene firma pero delega a notify()."""
    user = payload.get('user')
    if user is None:
        return False
    notify(
        user,
        subject=payload.get('subject', 'Notificación'),
        body=payload.get('body', ''),
        tipo=payload.get('tipo', 'INFO'),
        prioridad=payload.get('prioridad', 'MEDIUM'),
    )
    return True
