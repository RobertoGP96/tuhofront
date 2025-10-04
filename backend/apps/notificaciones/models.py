from django.db import models
from usuarios.models import Usuario

# Create your models here.
class Notificacion(models.Model):
    tipo = models.CharField(max_length=255)
    asunto = models.CharField(max_length=255)
    cuerpo = models.TextField()
    para = models.ForeignKey(Usuario, on_delete=models.CASCADE)
    creado = models.DateField(auto_created=True)
    visto = models.BooleanField(default=False)

    class Meta:
        verbose_name="Notificación"
        verbose_name_plural="Notificaciones"