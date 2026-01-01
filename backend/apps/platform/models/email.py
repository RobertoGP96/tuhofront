
class Email(TimeStampedModel, StatusMixin):
    """
    Modelo mejorado para configuración de emails del sistema.
    
    Gestiona las cuentas de email utilizadas para el envío de notificaciones
    y comunicaciones automáticas del sistema.
    """
    
    TIPO_CHOICES = [
        ('SMTP', _('SMTP Estándar')),
        ('GMAIL', _('Gmail')),
        ('OUTLOOK', _('Outlook/Hotmail')),
        ('CUSTOM', _('Personalizado')),
    ]
    
    nombre = models.CharField(
        max_length=100,
        verbose_name=_("Nombre identificativo"),
        help_text=_("Nombre para identificar esta configuración de email")
    )
    
    address = models.EmailField(
        unique=True,
        verbose_name=_("Dirección de email"),
        help_text=_("Dirección de correo electrónico")
    )
    
    tipo = models.CharField(
        max_length=10,
        choices=TIPO_CHOICES,
        default='SMTP',
        verbose_name=_("Tipo de servidor"),
        help_text=_("Tipo de servidor de correo electrónico")
    )
    
    smtp_server = models.CharField(
        max_length=255,
        verbose_name=_("Servidor SMTP"),
        help_text=_("Dirección del servidor SMTP")
    )
    
    smtp_port = models.PositiveIntegerField(
        default=587,
        verbose_name=_("Puerto SMTP"),
        help_text=_("Puerto del servidor SMTP (usualmente 587 o 465)")
    )
    
    smtp_username = models.CharField(
        max_length=255,
        verbose_name=_("Usuario SMTP"),
        help_text=_("Nombre de usuario para autenticación SMTP")
    )
    
    smtp_password = models.CharField(
        max_length=255,
        verbose_name=_("Contraseña SMTP"),
        help_text=_("Contraseña para autenticación SMTP")
    )
    
    use_tls = models.BooleanField(
        default=True,
        verbose_name=_("Usar TLS"),
        help_text=_("Utilizar cifrado TLS para la conexión")
    )
    
    use_ssl = models.BooleanField(
        default=False,
        verbose_name=_("Usar SSL"),
        help_text=_("Utilizar cifrado SSL para la conexión")
    )
    
    is_default = models.BooleanField(
        default=False,
        verbose_name=_("Configuración por defecto"),
        help_text=_("Usar esta configuración como predeterminada")
    )
    
    class Meta:
        verbose_name = _("Configuración de Email")
        verbose_name_plural = _("Configuraciones de Email")
        ordering = ['-is_default', 'nombre']
        constraints = [
            models.UniqueConstraint(
                fields=['is_default'],
                condition=Q(is_default=True),
                name='unique_default_email'
            ),
        ]

    def clean(self):
        """Validaciones personalizadas"""
        super().clean()
        
        # Validar puerto SMTP
        if not (1 <= self.smtp_port <= 65535):
            raise ValidationError({
                'smtp_port': _('El puerto debe estar entre 1 y 65535.')
            })
        
        # Validar que solo haya una configuración por defecto
        if self.is_default:
            existing_default = Email.objects.filter(
                is_default=True
            ).exclude(pk=self.pk).first()
            
            if existing_default:
                raise ValidationError({
                    'is_default': _('Ya existe una configuración marcada como predeterminada.')
                })

    def __str__(self):
        """Representación en string"""
        default_marker = " (Predeterminado)" if self.is_default else ""
        return f"{self.nombre} - {self.address}{default_marker}"

    def test_connection(self):
        """Prueba la conexión SMTP"""
        try:
            import smtplib
            
            if self.use_ssl:
                server = smtplib.SMTP_SSL(self.smtp_server, self.smtp_port)
            else:
                server = smtplib.SMTP(self.smtp_server, self.smtp_port)
                if self.use_tls:
                    server.starttls()
            
            server.login(self.smtp_username, self.smtp_password)
            server.quit()
            return True, _("Conexión exitosa")
            
        except Exception as e:
            return False, str(e)
