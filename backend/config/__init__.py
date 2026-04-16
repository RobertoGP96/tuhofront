"""
Carga la app de Celery al iniciar Django para que `@shared_task` funcione.
"""
try:
    from .celery import app as celery_app  # noqa: F401
except Exception:
    celery_app = None
