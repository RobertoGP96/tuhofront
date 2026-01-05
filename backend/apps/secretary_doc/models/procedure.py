from django.db import models
from django.utils.translation import gettext_lazy as _
from apps.platform.models.procedure import Procedure


class SecretaryDocProcedure(Procedure):
    """
    Modelo heredado de Procedure para solicitudes de secretaría docente.
    Contiene campos específicos para trámites de secretaría docente.
    """
    
    STUDY_TYPE_CHOICES = [
        ('PREGRADO', 'Pregrado'),
        ('POSGRADO', 'Posgrado'),
    ]
    
    INTEREST_CHOICES = [
        ('ESTATAL', 'Estatal'),
        ('NO_ESTATAL', 'No Estatal'),
    ]
    
    study_type = models.CharField(
        max_length=20,
        choices=STUDY_TYPE_CHOICES,
        verbose_name=_("Tipo de estudio"),
        help_text=_("Programa de pregrado o posgrado")
    )
    
    career = models.CharField(
        max_length=150,
        verbose_name=_("Carrera"),
        help_text=_("Carrera o programa académico")
    )
    
    year = models.CharField(
        max_length=10,
        verbose_name=_("Año"),
        help_text=_("Año de estudio")
    )
    
    academic_program = models.CharField(
        max_length=250,
        verbose_name=_("Programa académico"),
        help_text=_("Nombre del programa académico")
    )
    
    document_type = models.CharField(
        max_length=100,
        verbose_name=_("Tipo de documento"),
        help_text=_("Tipo de documento solicitado")
    )
    
    interest = models.CharField(
        max_length=20,
        choices=INTEREST_CHOICES,
        default='ESTATAL',
        verbose_name=_("Interés"),
        help_text=_("Tipo de interés (estatal/no estatal)")
    )
    
    # Datos del solicitante
    full_name = models.CharField(
        max_length=300,
        verbose_name=_("Nombre completo"),
        help_text=_("Nombre completo del solicitante")
    )
    
    id_card = models.CharField(
        max_length=15,
        verbose_name=_("Carné de identidad"),
        help_text=_("Número de carné de identidad")
    )
    
    email = models.EmailField(
        verbose_name=_("Correo electrónico"),
        help_text=_("Email del solicitante")
    )
    
    phone = models.CharField(
        max_length=20,
        verbose_name=_("Teléfono"),
        help_text=_("Teléfono de contacto")
    )
    
    # Datos del documento
    document_file = models.FileField(
        upload_to='secretary_doc/documents/',
        blank=True,
        null=True,
        verbose_name=_("Archivo del documento"),
        help_text=_("Archivo de soporte del trámite")
    )
    
    # Documentación de identidad (para legalización)
    registry_volume = models.CharField(
        max_length=10,
        blank=True,
        verbose_name=_("Tomo"),
        help_text=_("Tomo del registro")
    )
    
    registry_folio = models.CharField(
        max_length=10,
        blank=True,
        verbose_name=_("Folio"),
        help_text=_("Folio del registro")
    )
    
    registry_number = models.CharField(
        max_length=10,
        blank=True,
        verbose_name=_("Número"),
        help_text=_("Número del registro")
    )

    class Meta:
        verbose_name = _("Solicitud de Secretaría Docente")
        verbose_name_plural = _("Solicitudes de Secretaría Docente")
        ordering = ["-created_at"]

    def __str__(self):
        return f"Secretaría Docente - {self.user.username} ({self.get_state_display()})"
