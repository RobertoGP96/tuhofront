"""
Configuración de Celery para TUho.

Arranca el worker con:
    celery -A config worker -l info

Y el beat (si hay tareas periódicas):
    celery -A config beat -l info
"""
import os

try:
    from celery import Celery
except ImportError:
    Celery = None

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

if Celery is not None:
    app = Celery('tuho')
    app.config_from_object('django.conf:settings', namespace='CELERY')
    app.autodiscover_tasks()

    @app.task(bind=True)
    def debug_task(self):  # pragma: no cover
        print(f'Request: {self.request!r}')
else:  # pragma: no cover
    app = None
