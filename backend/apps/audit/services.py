"""
Servicio para registrar eventos de auditoría desde cualquier parte del sistema.

Uso típico (desde un view, signal o servicio):

    from apps.audit.services import log_event
    log_event(
        action='state_change',
        resource=reservation,
        description='Aprobada',
        metadata={'old': 'PENDIENTE', 'new': 'APROBADA'},
    )
"""
from typing import Any

from django.db import models

from .middleware import get_current_request_context
from .models import AuditLog


def _resolve_resource_info(resource: Any) -> tuple[str, str]:
    if resource is None:
        return '', ''
    if isinstance(resource, models.Model):
        meta = resource._meta
        return f'{meta.app_label}.{meta.object_name}', str(resource.pk)
    return str(type(resource).__name__), str(getattr(resource, 'pk', ''))


def log_event(
    *,
    action: str,
    resource: Any = None,
    resource_type: str | None = None,
    resource_id: str | None = None,
    user=None,
    description: str = '',
    metadata: dict | None = None,
    ip: str | None = None,
    user_agent: str | None = None,
) -> AuditLog:
    """Crea una entrada en la bitácora de auditoría.

    Si no se pasan `user`, `ip`, `user_agent`, intenta leerlos del contexto del
    request actual (vía AuditContextMiddleware).
    """
    ctx = get_current_request_context()
    if user is None:
        user = ctx.get('user')
    if ip is None:
        ip = ctx.get('ip')
    if user_agent is None:
        user_agent = ctx.get('user_agent', '')

    if resource_type is None or resource_id is None:
        rtype, rid = _resolve_resource_info(resource)
        resource_type = resource_type or rtype
        resource_id = resource_id or rid

    return AuditLog.objects.create(
        user=user if (user is not None and getattr(user, 'pk', None)) else None,
        action=action,
        resource_type=resource_type or '',
        resource_id=resource_id or '',
        description=description or '',
        metadata=metadata or {},
        ip_address=ip,
        user_agent=user_agent or '',
    )
