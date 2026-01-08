from django.apps import AppConfig


class SecretaryDocConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.secretary_doc'
    verbose_name = 'Secretaría Docente'
    
    def ready(self):
        # Import and connect signals
        from . import signals  # noqa
