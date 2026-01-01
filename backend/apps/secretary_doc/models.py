from django.conf import settings
from django.db import models
from backend.apps.plataforma.models.models import TramiteGeneral
from usuarios.models import Usuario
import uuid
from .choices import (
    Intereses,
    Programa_Academico,
    Estado,
    Organismo,
    Tipo_Estudio,
    Tipo_Est,
    Uso,
    Uso_i,
    Tipo_Tramite_PreN,
    Tipo_Tramite_PreI,
    Tipo_Tramite_PosN,
    Tipo_Tramite_PosI,
    )

# Create your models here.


# Tramites
class Tramite(TramiteGeneral):
    numero_seguimiento = models.CharField(max_length=36, blank=True)
    tipo_estudio = models.CharField(max_length=50, choices=Tipo_Estudio, default = "" )
    tipo_est = models.CharField(max_length=50, choices=Tipo_Est, default = "" )
    uso = models.CharField( max_length=50, choices= Uso, default = "" )
    uso_i = models.CharField( max_length=50,choices= Uso_i, default = "" )
    usuario = models.ForeignKey(Usuario, on_delete=models.CASCADE, blank=True, null=True)
    nombre = models.CharField(max_length = 150, blank=False, null=False)
    apellidos = models.CharField(max_length = 150, blank=False, null=False)
    ci = models.CharField(max_length = 11, blank=False, null=False)
    email = models.EmailField(max_length = 50, blank=False, null=False)
    telefono = models.CharField(max_length = 8, blank=False, null=False)
    tomo = models.CharField(max_length = 4, blank=False,null= False)
    folio = models.CharField(max_length = 4, blank=False,null= False)
    numero = models.CharField(max_length = 4, blank=False,null= False)
    fecha = models.DateField(blank=False, null=False, auto_now=True)
    estado = models.CharField(max_length = 100, blank=False, null=False, choices = Estado, default = "En Espera")
   
    intereses = models.CharField(max_length = 250, blank=False, null=False, choices=Intereses, default="Estatal")
    organismo = models.CharField(max_length = 150, blank=True, null=True)
    organismo_op = models.CharField(max_length = 250, choices= Organismo, default = "" )
    motivo = models.CharField(max_length = 250, blank=True, null=True)
    funcionario = models.CharField(max_length=50)
    carrera = models.CharField(max_length=50, blank=False, null=False)
    year = models.CharField(max_length = 4, blank=False, null=False)
    
    programa_academico = models.CharField(max_length = 250, blank=False, null=False, choices= Programa_Academico )
    nombre_programa =models.CharField(max_length = 250, blank=False, null=False)
    
    tipo_pren = models.CharField(max_length=50, blank=False, null=False, choices = Tipo_Tramite_PreN)
    tipo_prei = models.CharField(max_length=50, blank=False, null=False, choices = Tipo_Tramite_PreI)
    tipo_posn = models.CharField(max_length=50, blank=False, null=False, choices = Tipo_Tramite_PosN)
    tipo_posi = models.CharField(max_length=50, blank=False, null=False, choices = Tipo_Tramite_PosI)
    legalizacion = models.CharField(max_length=50, default='Legalización de Foto Copia de Título')
    
    archivo = models.FileField(upload_to='TramiteLegalizacion/' , null=False, blank=False)
    
    
    def __init__(self, *args, **kwargs) -> None:
        super().__init__(*args, **kwargs)
        self.nombre_tramite = "Secretaría Docente"

    def __str__(self):
        return f"{self.ci} - {self.nombre}"
    

    class Meta:
        managed = True 
        


class TramiteSecretariaDocente(models.Model):
    """
    Modelo detalle que referencia al `plataforma.Tramite` central.
    Contiene los campos específicos de Secretaría Docente.
    """
    tramite = models.OneToOneField('plataforma.Tramite', on_delete=models.CASCADE, related_name='secretaria_detalle')
    tipo_estudio = models.CharField(max_length=50, choices=Tipo_Estudio, default="")
    tipo_est = models.CharField(max_length=50, choices=Tipo_Est, default="")
    uso = models.CharField(max_length=50, choices=Uso, default="")
    uso_i = models.CharField(max_length=50, choices=Uso_i, default="")
    nombre = models.CharField(max_length=150, blank=False, null=False)
    apellidos = models.CharField(max_length=150, blank=False, null=False)
    ci = models.CharField(max_length=11, blank=False, null=False)
    email = models.EmailField(max_length=50, blank=False, null=False)
    telefono = models.CharField(max_length=8, blank=False, null=False)
    tomo = models.CharField(max_length=4, blank=False, null=False)
    folio = models.CharField(max_length=4, blank=False, null=False)
    numero = models.CharField(max_length=4, blank=False, null=False)
    fecha = models.DateField(blank=False, null=False, auto_now=True)
    estado = models.CharField(max_length=100, blank=False, null=False, choices=Estado, default="En Espera")
    intereses = models.CharField(max_length=250, blank=False, null=False, choices=Intereses, default="Estatal")
    organismo = models.CharField(max_length=150, blank=True, null=True)
    organismo_op = models.CharField(max_length=250, choices=Organismo, default="")
    motivo = models.CharField(max_length=250, blank=True, null=True)
    funcionario = models.CharField(max_length=50)
    carrera = models.CharField(max_length=50, blank=False, null=False)
    year = models.CharField(max_length=4, blank=False, null=False)
    programa_academico = models.CharField(max_length=250, blank=False, null=False, choices=Programa_Academico)
    nombre_programa = models.CharField(max_length=250, blank=False, null=False)
    tipo_pren = models.CharField(max_length=50, blank=False, null=False, choices=Tipo_Tramite_PreN)
    tipo_prei = models.CharField(max_length=50, blank=False, null=False, choices=Tipo_Tramite_PreI)
    tipo_posn = models.CharField(max_length=50, blank=False, null=False, choices=Tipo_Tramite_PosN)
    tipo_posi = models.CharField(max_length=50, blank=False, null=False, choices=Tipo_Tramite_PosI)
    legalizacion = models.CharField(max_length=50, default='Legalización de Foto Copia de Título')
    archivo = models.FileField(upload_to='TramiteLegalizacion/', null=False, blank=False)

    def __str__(self):
        return f"Detalle secretaria - {self.tramite}"

    class Meta:
        verbose_name = "Trámite - Secretaría Docente (detalle)"
        verbose_name_plural = "Trámites - Secretaría Docente (detalles)"


