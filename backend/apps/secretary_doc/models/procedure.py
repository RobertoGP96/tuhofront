from django.db import models
from django.utils.translation import gettext_lazy as _
from apps.platform.models.procedure import Procedure
from apps.platform.models.user import User
from model_utils import FieldTracker


class SecretaryDocProcedure(Procedure):
    """
    Modelo heredado de Procedure para solicitudes de secretaría docente.
    Contiene campos específicos para trámites de secretaría docente.
    """
    
    # Tipo de trámite (usado para filtrado)
    TRAMITE_TYPE = 'SECRETARIA_DOCENTE'
    
    # Opciones para los campos de selección
    STUDY_TYPE_CHOICES = [
        ('PREGRADO', 'Pregrado'),
        ('POSGRADO', 'Posgrado'),
    ]

    STUDY_VISIBILITY_CHOICES = [
        ('NACIONAL', 'Nacional'),
        ('INTERNACIONAL', 'Internacional'),
    ]
    
    INTEREST_CHOICES = [
        ('ESTATAL', 'Estatal'),
        ('NO_ESTATAL', 'No Estatal'),
    ]


    
    # Campos específicos para trámites de secretaría docente
    study_type = models.CharField(
        max_length=20,
        choices=STUDY_TYPE_CHOICES,
        verbose_name=_("Tipo de estudio"),
        help_text=_("Programa de pregrado o posgrado")
    )

    # Campos específicos para trámites de secretaría docente
    visibility_type = models.CharField(
        max_length=20,
        choices=STUDY_VISIBILITY_CHOICES,
        verbose_name=_("Tipo de visibilidad"),
        help_text=_("Visibilidad nacional o internacional")
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
    
    # Datos del solicitante (estos podrían heredarse del usuario, pero se guardan aquí para referencia)
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
        upload_to='secretary_doc/documents/%Y/%m/%d/',
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
    
    folio = models.CharField(
        max_length=10,
        blank=True,
        verbose_name=_("Folio"),
        help_text=_("Folio del registro")
    )
    
    number = models.CharField(
        max_length=10,
        blank=True,
        verbose_name=_("Número"),
        help_text=_("Número del registro")
    )
    
    # Auditoría
    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_secretary_procedures',
        verbose_name=_("Creado por"),
        help_text=_("Usuario que creó el trámite")
    )
    
    updated_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='updated_secretary_procedures',
        verbose_name=_("Actualizado por"),
        help_text=_("Último usuario que actualizó el trámite")
    )
    
    # Rastreador de cambios
    tracker = FieldTracker(fields=['state'])
    
    class Meta:
        verbose_name = _("Trámite de Secretaría Docente")
        verbose_name_plural = _("Trámites de Secretaría Docente")
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['study_type', 'career']),
            models.Index(fields=['id_card']),
            models.Index(fields=['state']),
        ]
    
    def __str__(self):
        return f"{self.full_name} - {self.get_state_display()} - {self.created_at.strftime('%Y-%m-%d') if self.created_at else ''}"
    
    def save(self, *args, **kwargs):
        # Lógica adicional antes de guardar
        if not self.pk:  # Si es un nuevo registro
            if hasattr(self, 'user'):
                self.full_name = f"{self.user.first_name} {self.user.last_name}"
                self.email = self.user.email
            # Aquí puedes agregar más lógica de inicialización
        
        super().save(*args, **kwargs)
    
    def get_absolute_url(self):
        from django.urls import reverse
        return reverse('secretary_doc:procedure_detail', args=[str(self.id)])
    
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
