from django.db import models
from datetime import datetime
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _
from model_utils.managers import InheritanceManager

def validate_file_extension(value):
    import os
    ext = os.path.splitext(value.name)[1]  # Obtiene la extensión del archivo
    valid_extensions = ['.jpg', '.png',]
    if not ext.lower() in valid_extensions:
        raise ValidationError(_('Archivo no soportado'))
# Create your models here.

# Modelo de Noticias
class Noticias(models.Model):
    titulo = models.CharField(max_length=255)
    imagen_cabecera = models.ImageField(upload_to=f"Noticias/{datetime.now().date().strftime('%d-%m-%Y')}/", blank=True, null=True, validators=[validate_file_extension])
    resumen = models.CharField(max_length=250, null=True, blank=True)
    cuerpo = models.TextField()
    #cuerpo = RichTextField()
    on_create = models.DateField(auto_now_add=True)
    on_modified = models.DateField(auto_now=True)

    def __str__(self) -> str:
        return f"{self.titulo} - {self.on_create}"
    class Meta:
        verbose_name="noticia"
        verbose_name_plural="noticias"
        
class Email(models.Model):
    address = models.EmailField(unique=True)
    smtp_server = models.CharField(max_length=255)
    smtp_port = models.CharField(max_length=3)
    smtp_username = models.CharField(max_length=255)
    smtp_password = models.CharField(max_length=255)

    def __str__(self):
        return self.address
    
class TramiteGeneral(models.Model):
    objects = InheritanceManager()
    nombre_tramite = models.CharField(max_length=250)
    on_create = models.DateField(auto_now_add=True)
    on_modified = models.DateField(auto_now=True)
    
    class META:
        abstract = True
    
class EstadosTramites(models.Model):
    nombre = models.CharField(max_length=255)
    is_active = models.BooleanField(default=True)