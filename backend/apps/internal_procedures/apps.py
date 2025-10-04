from django.apps import AppConfig

class InternalProceduresConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'internal_procedures'

    def ready(self):
        import internal_procedures.signals
