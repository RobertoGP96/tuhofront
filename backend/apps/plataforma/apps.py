from django.apps import AppConfig
import os
from django.conf import settings
#from .models import ConfiguracionGeneral


class PruebaappConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'plataforma'
    '''def ready(self):
        if os.environ.get("RUN_MAIN"):
            conf_global = ConfiguracionGeneral.objects.all().first()
            settings.configure(
                EMAIL_HOST_USER = conf_global.correo,
                EMAIL_HOST_PASSWORD = conf_global.contraseña_correo,  
            ) '''