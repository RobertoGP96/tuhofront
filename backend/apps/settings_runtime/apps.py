from django.apps import AppConfig


class SettingsRuntimeConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.settings_runtime'
    label = 'settings_runtime'
    verbose_name = 'Configuración en tiempo de ejecución'
