from django.apps import AppConfig

class InternalConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.internal'

    def ready(self):
        import apps.internal.signals
