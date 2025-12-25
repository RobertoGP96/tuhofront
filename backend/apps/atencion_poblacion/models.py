from typing import Any
from django.db import models
from plataforma.models import TramiteGeneral
from usuarios.models import Usuario
from datetime import datetime
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _
import uuid
from .choices import consulta_choice, municipality_choice, estado_choice

def validate_file_extension(value):
    import os
    ext = os.path.splitext(value.name)[1]  # Obtiene la extensión del archivo
    valid_extensions = ['.pdf', '.doc', '.docx', '.jpg', '.png', '.xlsx']
    if not ext.lower() in valid_extensions:
        raise ValidationError(_('Archivo no soportado'))

# Create your models here.
class AtencionPoblacion(TramiteGeneral):
    nombre = models.CharField(max_length=250)
    apellidos = models.CharField(max_length=250)
    email = models.EmailField();
    ci = models.CharField(max_length=11);
    telefono = models.CharField(max_length = 8);
    direccion = models.CharField(max_length = 250);
    municipality = models.CharField(max_length=250, choices=municipality_choice)
    consulta = models.CharField(max_length=250, choices=consulta_choice)
    adjunto = models.FileField(upload_to=f"AtencionPoblacion/{datetime.now().date().strftime('%d-%m-%Y')}/", blank=True, null=True, validators=[validate_file_extension])
    asunto = models.CharField(max_length=250);
    mensaje = models.TextField()
    usuario = models.ForeignKey(Usuario, on_delete=models.CASCADE, blank=True, null=True)
    numero_seguimiento = models.UUIDField(default=uuid.uuid4, max_length=8, editable=False, unique=True)
    estado = models.CharField(max_length=255, blank=False, null=False, choices=estado_choice, default="En espera")

    def __init__(self, *args: Any, **kwargs: Any) -> None:
        super().__init__(*args, **kwargs)
        self.nombre_tramite = "Atención a la población"
        
    def __str__(self) -> str:
        return f"{self.nombre} - {self.apellidos} - {self.asunto} - {self.created_at}"
    
    class Meta:
        verbose_name="atención a la población"
        verbose_name_plural="atención a la población"
