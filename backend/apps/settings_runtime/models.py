"""
Configuración del sistema editable en runtime.

Mantiene un registro singleton con opciones institucionales que pueden cambiar
sin redeploy: nombre institución, horarios permitidos de reserva, duración
mínima/máxima, restricciones por rol, etc.

También expone `LdapConfig`, otro singleton con la configuración del directorio
LDAP institucional (servidor, base DN, mapeo grupo→rol, etc.). El password del
bind DN NUNCA se almacena en BD: se lee de `os.getenv('LDAP_BIND_PASSWORD')`.
"""
from django.core.cache import cache
from django.db import models
from django.utils.translation import gettext_lazy as _


SETTINGS_CACHE_KEY = 'tuho:system_settings'
SETTINGS_CACHE_TTL = 300  # 5 min

LDAP_CONFIG_CACHE_KEY = 'tuho:ldap_config'
LDAP_CONFIG_CACHE_TTL = 300  # 5 min


class SystemSettings(models.Model):
    """Singleton con configuración institucional editable en runtime."""

    # Institucional
    institution_name = models.CharField(max_length=200, default='Universidad de Holguín')
    institution_short_name = models.CharField(max_length=50, default='UHo')
    institution_address = models.CharField(max_length=300, blank=True)
    institution_website = models.URLField(blank=True)
    institution_logo = models.ImageField(upload_to='settings/', null=True, blank=True)
    support_email = models.EmailField(blank=True)

    # Reservas
    reservation_min_minutes = models.PositiveIntegerField(
        default=30,
        help_text=_('Duración mínima (minutos) de una reserva'),
    )
    reservation_max_minutes = models.PositiveIntegerField(
        default=8 * 60,
        help_text=_('Duración máxima (minutos) de una reserva'),
    )
    reservation_open_hour = models.PositiveSmallIntegerField(
        default=7,
        help_text=_('Hora de apertura para reservas (0-23)'),
    )
    reservation_close_hour = models.PositiveSmallIntegerField(
        default=21,
        help_text=_('Hora de cierre para reservas (0-23)'),
    )
    reservation_advance_days = models.PositiveSmallIntegerField(
        default=90,
        help_text=_('Máximo de días en el futuro para reservar'),
    )

    # Módulos activos
    module_internal_enabled = models.BooleanField(default=True)
    module_secretary_enabled = models.BooleanField(default=True)
    module_labs_enabled = models.BooleanField(default=True)
    module_news_enabled = models.BooleanField(default=True)

    # Firma/Emisión
    signature_enabled = models.BooleanField(default=False)
    qr_verification_enabled = models.BooleanField(default=True)

    # Audit
    updated_at = models.DateTimeField(auto_now=True)
    updated_by = models.ForeignKey(
        'platform.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='+',
    )

    class Meta:
        app_label = 'settings_runtime'
        verbose_name = _('Configuración del sistema')
        verbose_name_plural = _('Configuración del sistema')

    def __str__(self) -> str:
        return f'Configuración TUho · {self.institution_name}'

    def save(self, *args, **kwargs):
        # Singleton: siempre pk=1
        self.pk = 1
        super().save(*args, **kwargs)
        cache.set(SETTINGS_CACHE_KEY, self, SETTINGS_CACHE_TTL)

    @classmethod
    def load(cls) -> 'SystemSettings':
        cached = cache.get(SETTINGS_CACHE_KEY)
        if cached is not None:
            return cached
        obj, _ = cls.objects.get_or_create(pk=1)
        cache.set(SETTINGS_CACHE_KEY, obj, SETTINGS_CACHE_TTL)
        return obj


# user_type choices admitidos para el mapeo grupo LDAP → rol.
# Debe mantenerse sincronizado con apps.platform.models.user.User.UserType.
LDAP_USER_TYPE_CHOICES = (
    ('USUARIO', 'Usuario'),
    ('GESTOR_INTERNO', 'Gestor de Trámites Internos'),
    ('GESTOR_SECRETARIA', 'Gestor de Secretaría Docente'),
    ('GESTOR_RESERVAS', 'Gestor de Reservas'),
    ('ADMIN', 'Administrador'),
)


class LdapConfig(models.Model):
    """Singleton con la configuración de autenticación externa.

    Aunque el nombre `LdapConfig` se mantiene por compatibilidad con la
    primera versión del módulo, este modelo ahora soporta **múltiples
    proveedores** (LDAP directo, API HTTP REST, etc.) seleccionables vía
    el campo `provider`. La arquitectura está pensada para añadir nuevos
    proveedores (OAuth2, SAML, OpenID Connect) sin migraciones disruptivas.

    El backend `apps.platform.auth.ldap.RuntimeLdapBackend` consulta este
    modelo (cacheado 5 min) en cada intento de autenticación y delega en
    el `ExternalAuthProvider` correspondiente. Si `enabled=False` cede
    control inmediatamente a `ModelBackend` (auth local).

    Secrets (password del bind DN, API tokens) se leen SIEMPRE de variables
    de entorno (`LDAP_BIND_PASSWORD`, `EXTERNAL_AUTH_HTTP_API_TOKEN`, …) —
    nunca se almacenan en BD ni se exponen vía API.
    """

    # Proveedores soportados
    PROVIDER_LDAP = 'ldap'
    PROVIDER_HTTP_API = 'http_api'
    PROVIDER_CHOICES = (
        (PROVIDER_LDAP, 'LDAP directo (python-ldap)'),
        (PROVIDER_HTTP_API, 'API HTTP REST'),
    )

    # --- Activación ---
    enabled = models.BooleanField(
        default=False,
        help_text=_('Habilitar autenticación externa'),
    )
    provider = models.CharField(
        max_length=20,
        choices=PROVIDER_CHOICES,
        default=PROVIDER_LDAP,
        help_text=_('Proveedor de autenticación externa a usar'),
    )

    # --- Conexión ---
    server_uri = models.CharField(
        max_length=255,
        blank=True,
        help_text=_('Ej: ldap://host:389 o ldaps://host:636'),
    )
    use_start_tls = models.BooleanField(
        default=False,
        help_text=_('Negociar StartTLS sobre conexión ldap:// (no usar con ldaps://)'),
    )
    connect_timeout = models.PositiveSmallIntegerField(
        default=5,
        help_text=_('Timeout de red en segundos'),
    )
    tls_require_cert = models.CharField(
        max_length=10,
        default='demand',
        choices=(
            ('never', 'never (NO usar en producción)'),
            ('allow', 'allow'),
            ('demand', 'demand (recomendado)'),
            ('hard', 'hard'),
        ),
        help_text=_('Política de validación de certificado TLS'),
    )

    # --- Bind (search-bind pattern) ---
    bind_dn = models.CharField(
        max_length=255,
        blank=True,
        help_text=_('DN del usuario técnico que busca usuarios. Vacío = bind anónimo'),
    )

    # --- Búsqueda de usuarios ---
    user_search_base = models.CharField(
        max_length=255,
        blank=True,
        help_text=_('Ej: ou=people,dc=uho,dc=edu,dc=cu'),
    )
    user_search_filter = models.CharField(
        max_length=255,
        default='(uid=%(user)s)',
        help_text=_('Filtro LDAP; %(user)s se reemplaza por el username'),
    )

    # --- Atributos a mapear (LDAP → User) ---
    attr_username = models.CharField(max_length=64, default='uid')
    attr_email = models.CharField(max_length=64, default='mail')
    attr_first_name = models.CharField(max_length=64, default='givenName')
    attr_last_name = models.CharField(max_length=64, default='sn')
    attr_id_card = models.CharField(
        max_length=64,
        blank=True,
        help_text=_('Atributo LDAP que contiene el carnet de identidad (opcional)'),
    )

    # --- Búsqueda de grupos ---
    group_search_base = models.CharField(max_length=255, blank=True)
    group_search_filter = models.CharField(
        max_length=255,
        default='(objectClass=groupOfNames)',
    )
    group_type = models.CharField(
        max_length=64,
        default='GroupOfNamesType',
        choices=(
            ('GroupOfNamesType', 'groupOfNames'),
            ('PosixGroupType', 'posixGroup'),
            ('ActiveDirectoryGroupType', 'AD group'),
            ('NestedActiveDirectoryGroupType', 'AD nested group'),
        ),
    )

    # ====================================================================
    # Provider: HTTP API REST
    # ====================================================================
    # Para autenticar contra un endpoint HTTP (p. ej. auth.uho.edu.cu).
    # El proveedor envía las credenciales del usuario al `http_api_base_url +
    # http_api_login_path` y mapea la respuesta JSON a un objeto User local.
    # Secrets adicionales (tokens estáticos para `Authorization: Bearer ...`)
    # se inyectan vía variable de entorno EXTERNAL_AUTH_HTTP_API_TOKEN.

    http_api_base_url = models.CharField(
        max_length=255,
        blank=True,
        help_text=_('Ej: https://auth.uho.edu.cu'),
    )
    http_api_login_path = models.CharField(
        max_length=255,
        default='/api/login',
        help_text=_('Path del endpoint de login (relativo a base_url)'),
    )
    http_api_method = models.CharField(
        max_length=10,
        default='POST',
        choices=(('POST', 'POST'), ('GET', 'GET')),
    )
    http_api_username_field = models.CharField(
        max_length=64,
        default='username',
        help_text=_('Nombre del campo en el body de la petición que lleva el usuario'),
    )
    http_api_password_field = models.CharField(
        max_length=64,
        default='password',
        help_text=_('Nombre del campo en el body de la petición que lleva el password'),
    )
    http_api_extra_headers = models.JSONField(
        default=dict,
        blank=True,
        help_text=_(
            'Headers adicionales para la petición. Ej: {"X-Tenant": "uho"}. '
            'NO incluir aquí tokens — usar la var de entorno '
            'EXTERNAL_AUTH_HTTP_API_TOKEN (se envía como Authorization: Bearer).'
        ),
    )
    http_api_verify_ssl = models.BooleanField(
        default=True,
        help_text=_('Verificar el certificado TLS del servidor remoto'),
    )
    http_api_timeout = models.PositiveSmallIntegerField(
        default=10,
        help_text=_('Timeout (segundos) de la petición HTTP'),
    )

    # Mapeo de respuesta → atributos del User local (paths con notación de
    # punto sobre el JSON de respuesta). Ej. user_path='data.user' significa
    # que el objeto del usuario está en response_json['data']['user'].
    http_api_success_field = models.CharField(
        max_length=255,
        blank=True,
        help_text=_(
            'Path opcional a un campo booleano de éxito. Si vacío, se usa '
            'el código de estado HTTP (2xx = éxito).'
        ),
    )
    http_api_user_path = models.CharField(
        max_length=255,
        blank=True,
        help_text=_(
            'Path al objeto user dentro del JSON de respuesta '
            '(vacío = raíz). Ej: "user" o "data.user".'
        ),
    )
    http_api_attr_username = models.CharField(max_length=64, default='username')
    http_api_attr_email = models.CharField(max_length=64, default='email')
    http_api_attr_first_name = models.CharField(max_length=64, default='first_name')
    http_api_attr_last_name = models.CharField(max_length=64, default='last_name')
    http_api_attr_id_card = models.CharField(max_length=64, blank=True)
    http_api_attr_personal_photo = models.CharField(
        max_length=128,
        blank=True,
        help_text=_(
            'Path al campo con la foto del usuario en la respuesta '
            '(notación de punto). Ej: "personal_information.personal_photo". '
            'Vacío = no sincronizar foto.'
        ),
    )
    http_api_groups_path = models.CharField(
        max_length=255,
        blank=True,
        help_text=_(
            'Path a la lista de grupos/roles en la respuesta. '
            'Ej: "roles", "user.groups". Vacío = no se sincronizan grupos.'
        ),
    )
    http_api_email_template = models.CharField(
        max_length=128,
        blank=True,
        help_text=_(
            'Plantilla para sintetizar email cuando la API no lo devuelve. '
            'Placeholders soportados: {username}. Ej: "{username}@uho.edu.cu". '
            'Vacío = no sintetizar (email puede quedar vacío).'
        ),
    )

    # --- Mapeo grupo LDAP → user_type / staff / superuser ---
    group_to_role_map = models.JSONField(
        default=dict,
        blank=True,
        help_text=_(
            'Diccionario {"<grupo>": "<user_type>"}. Para LDAP la clave es '
            'el DN completo; para HTTP API es el nombre del rol/grupo '
            'devuelto por el endpoint. Ej. LDAP: '
            '{"cn=gestores_internos,ou=groups,dc=uho,dc=edu,dc=cu": "GESTOR_INTERNO"}. '
            'Ej. HTTP: {"gestor_secretaria": "GESTOR_SECRETARIA", "usuario": "USUARIO"}.'
        ),
    )
    default_role = models.CharField(
        max_length=20,
        default='USUARIO',
        choices=LDAP_USER_TYPE_CHOICES,
        help_text=_('user_type asignado si ningún grupo coincide'),
    )
    make_staff_groups = models.JSONField(
        default=list,
        blank=True,
        help_text=_('Lista de DN de grupos cuyos miembros obtienen is_staff=True'),
    )
    make_superuser_groups = models.JSONField(
        default=list,
        blank=True,
        help_text=_('Lista de DN de grupos cuyos miembros obtienen is_superuser=True'),
    )

    # --- Comportamiento ---
    auto_create_users = models.BooleanField(
        default=True,
        help_text=_('Crear usuario local en el primer login LDAP exitoso'),
    )
    fallback_to_local = models.BooleanField(
        default=True,
        help_text=_('Si LDAP falla o no autentica, intentar autenticar contra BD local'),
    )
    sync_on_login = models.BooleanField(
        default=True,
        help_text=_('Sincronizar atributos LDAP → User en cada login exitoso'),
    )

    # --- Estado del último test de conexión (solo lectura) ---
    last_test_at = models.DateTimeField(null=True, blank=True)
    last_test_ok = models.BooleanField(null=True, blank=True)
    last_test_message = models.TextField(blank=True)

    # --- Audit ---
    updated_at = models.DateTimeField(auto_now=True)
    updated_by = models.ForeignKey(
        'platform.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='+',
    )

    class Meta:
        app_label = 'settings_runtime'
        verbose_name = _('Configuración LDAP')
        verbose_name_plural = _('Configuración LDAP')

    def __str__(self) -> str:
        state = 'habilitado' if self.enabled else 'deshabilitado'
        return f'LDAP {state} · {self.server_uri or "(sin servidor)"}'

    def save(self, *args, **kwargs):
        # Singleton: siempre pk=1
        self.pk = 1
        super().save(*args, **kwargs)
        cache.set(LDAP_CONFIG_CACHE_KEY, self, LDAP_CONFIG_CACHE_TTL)

    @classmethod
    def load(cls) -> 'LdapConfig':
        cached = cache.get(LDAP_CONFIG_CACHE_KEY)
        if cached is not None:
            return cached
        obj, _ = cls.objects.get_or_create(pk=1)
        cache.set(LDAP_CONFIG_CACHE_KEY, obj, LDAP_CONFIG_CACHE_TTL)
        return obj

    @classmethod
    def invalidate_cache(cls) -> None:
        cache.delete(LDAP_CONFIG_CACHE_KEY)
