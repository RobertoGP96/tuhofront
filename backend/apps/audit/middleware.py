"""
Middleware que almacena el contexto de request (usuario, IP, user-agent) en
un threading local para que los signals/handlers de `audit.services.log_event`
puedan leerlo sin recibir `request` explícitamente.
"""
import threading


_local = threading.local()


def get_current_request_context() -> dict:
    """Retorna el contexto actual del request; vacío si fuera de una request."""
    return getattr(_local, 'context', {}) or {}


def _extract_ip(request) -> str | None:
    # Considera proxy/X-Forwarded-For (solo confiable si hay proxy controlado)
    forwarded = request.META.get('HTTP_X_FORWARDED_FOR', '')
    if forwarded:
        return forwarded.split(',')[0].strip()
    return request.META.get('REMOTE_ADDR')


class AuditContextMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        user = getattr(request, 'user', None)
        _local.context = {
            'user': user if (user is not None and getattr(user, 'is_authenticated', False)) else None,
            'ip': _extract_ip(request),
            'user_agent': request.META.get('HTTP_USER_AGENT', '')[:500],
            'path': request.path,
            'method': request.method,
        }
        try:
            return self.get_response(request)
        finally:
            _local.context = {}
