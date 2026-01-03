from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _
from django.db.models import Q
from validators import validate_carnet_identidad, validate_telefono_cuba, validate_token_activacion
from backend.apps.platform.models.base_models import TimeStampedModel


class UserManager(models.Manager):
    """Manager personalizado para el modelo Usuario"""
    
    def active_users(self):
        """Retorna solo usuarios activos"""
        return self.filter(is_active=True)
    
    def by_carnet(self, carnet):
        """Busca usuario por carnet de identidad"""
        return self.filter(id_card=carnet).first()
    
    def staff_users(self):
        """Retorna solo usuarios staff"""
        return self.filter(is_staff=True, is_active=True)


class User(AbstractUser):
    """
    Modelo de Usuario extendido para el sistema universitario.
    
    Extiende el modelo AbstractUser de Django agregando campos específicos
    para la gestión universitaria cubana.
    """
    
    # Campos adicionales con validaciones mejoradas
    activation_token = models.CharField(
        max_length=255,  # Aumentado para tokens más seguros
        blank=True,
        null=True,
        validators=[validate_token_activacion],
        verbose_name=_("Token de activación"),
        help_text=_("Token utilizado para activar la cuenta del usuario")
    )
    
    id_card = models.CharField(
        max_length=11,
        unique=True,  # Los carnets deben ser únicos
        validators=[validate_carnet_identidad],
        verbose_name=_("Carnet de identidad"),
        help_text=_("Número de carnet de identidad (11 dígitos)")
    )
    
    phone = models.CharField(
        max_length=15,  # Aumentado para flexibilidad
        blank=True,
        null=True,
        validators=[validate_telefono_cuba],
        verbose_name=_("Teléfono"),
        help_text=_("Número de teléfono (8 dígitos para Cuba)")
    )
    
    address = models.TextField(
        blank=True,
        null=True,
        max_length=500,  # Límite razonable
        verbose_name=_("Dirección"),
        help_text=_("Dirección completa de residencia")
    )
    
    # Campos adicionales útiles para el contexto universitario
    date_of_birth = models.DateField(
        blank=True,
        null=True,
        verbose_name=_("Fecha de nacimiento"),
        help_text=_("Fecha de nacimiento del usuario")
    )
    
    user_type = models.CharField(
        max_length=20,
        choices=[
            ('ESTUDIANTE', _('Estudiante')),
            ('PROFESOR', _('Profesor')),
            ('TRABAJADOR', _('Trabajador')),
            ('EXTERNO', _('Externo')),
        ],
        default='ESTUDIANTE',
        verbose_name=_("Tipo de usuario"),
        help_text=_("Categoría del usuario en el sistema universitario")
    )
    
    workplace = models.CharField(
        max_length=200,
        blank=True,
        null=True,
        verbose_name=_("Centro de trabajo"),
        help_text=_("Institución o departamento donde trabaja/estudia")
    )
    
    # Campos de auditoría
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name=_("Fecha de creación")
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name=_("Última actualización")
    )
    
    # Campos de control
    email_verified = models.BooleanField(
        default=False,
        verbose_name=_("Email verificado"),
        help_text=_("Indica si el email ha sido verificado")
    )
    
    phone_verified = models.BooleanField(
        default=False,
        verbose_name=_("Teléfono verificado"),
        help_text=_("Indica si el teléfono ha sido verificado")
    )
    
    # Manager personalizado
    objects = UserManager()
    
    class Meta:
        verbose_name = _("Usuario")
        verbose_name_plural = _("Usuarios")
        ordering = ['-date_joined']
        indexes = [
            models.Index(fields=['id_card']),
            models.Index(fields=['email']),
            models.Index(fields=['user_type']),
            models.Index(fields=['is_active', 'is_staff']),
        ]
        constraints = [
            models.UniqueConstraint(
                fields=['id_card'],
                name='unique_carnet_identidad'
            ),
            models.CheckConstraint(
                check=Q(id_card__isnull=False) & ~Q(id_card=''),
                name='carnet_not_empty'
            ),
        ]

    def clean(self):
        """Validaciones personalizadas a nivel de modelo"""
        super().clean()
        
        # Validar que el email sea único (case-insensitive)
        if self.email:
            existing_user = User.objects.filter(
                email__iexact=self.email
            ).exclude(pk=self.pk).first()
            
            if existing_user:
                raise ValidationError({
                    'email': _('Ya existe un usuario con este email.')
                })
        
        # Validar id_card único
        if getattr(self, 'id_card', None):
            existing_carnet = User.objects.filter(
                id_card=self.id_card
            ).exclude(pk=self.pk).first()
            
            if existing_carnet:
                raise ValidationError({
                    'id_card': _('Ya existe un usuario con este carnet de identidad.')
                })
        
        # Validar fecha de nacimiento si se proporciona
        if getattr(self, 'date_of_birth', None):
            from datetime import date
            today = date.today()
            age = today.year - self.date_of_birth.year - (
                (today.month, today.day) < (self.date_of_birth.month, self.date_of_birth.day)
            )
            
            if age < 16:
                raise ValidationError({
                    'date_of_birth': _('El usuario debe tener al menos 16 años.')
                })
            
            if age > 100:
                raise ValidationError({
                    'date_of_birth': _('La fecha de nacimiento no es válida.')
                })

    def save(self, *args, **kwargs):
        """Sobrescribe save para ejecutar validaciones y lógica personalizada"""
        # Ejecutar validaciones
        self.full_clean()
        
        # Normalizar email a lowercase
        if self.email:
            self.email = self.email.lower()
        
        # Limpiar espacios en carnet
        if getattr(self, 'id_card', None):
            self.id_card = self.id_card.replace(' ', '')
        
        super().save(*args, **kwargs)

    def __str__(self):
        """Representación en string del usuario"""
        if self.first_name and self.last_name:
            return f"{self.first_name} {self.last_name} ({self.username})"
        return self.username

    def get_full_name(self):
        """Retorna el nombre completo del usuario"""
        if self.first_name and self.last_name:
            return f"{self.first_name} {self.last_name}".strip()
        return self.username

    def get_short_name(self):
        """Retorna el nombre corto del usuario"""
        return self.first_name or self.username

    @property
    def age(self):
        """Calcula la edad del usuario basada en su fecha de nacimiento"""
        if not getattr(self, 'date_of_birth', None):
            return None
        
        from datetime import date
        today = date.today()
        return today.year - self.date_of_birth.year - (
            (today.month, today.day) < (self.date_of_birth.month, self.date_of_birth.day)
        )

    @property
    def is_verified(self):
        """Verifica si el usuario tiene email y teléfono verificados"""
        return self.email_verified and (not getattr(self, 'phone', None) or self.phone_verified)

    def generate_activation_token(self):
        """Genera un nuevo token de activación"""
        import secrets
        self.activation_token = secrets.token_urlsafe(32)
        self.save(update_fields=['activation_token'])
        return self.activation_token

    def activate_account(self):
        """Activa la cuenta del usuario"""
        self.is_active = True
        self.email_verified = True
        self.activation_token = None
        self.save(update_fields=['is_active', 'email_verified', 'activation_token'])

    def verify_phone(self):
        """Marca el teléfono como verificado"""
        self.phone_verified = True
        self.save(update_fields=['phone_verified'])

    def get_carnet_masked(self):
        """Retorna el carnet parcialmente oculto por seguridad"""
        if not getattr(self, 'id_card', None):
            return ""
        return f"***{self.id_card[-4:]}"

    def can_access_module(self, module_name):
        """Verifica si el usuario puede acceder a un módulo específico"""
        # Lógica de permisos por módulo
        if self.is_superuser:
            return True
        
        if self.is_staff:
            return True
        
        # Lógica específica por tipo de usuario
        module_permissions = {
            'ESTUDIANTE': ['plataforma', 'notificaciones', 'atencion_poblacion'],
            'PROFESOR': ['plataforma', 'notificaciones', 'secretaria_docente', 'labs'],
            'TRABAJADOR': ['plataforma', 'notificaciones', 'internal'],
            'EXTERNO': ['atencion_poblacion', 'notificaciones'],
        }
        
        allowed_modules = module_permissions.get(self.user_type, [])
        return module_name in allowed_modules