from django.conf import settings as django_settings
from rest_framework import serializers

from .models import LDAP_USER_TYPE_CHOICES, LdapConfig, SystemSettings


class SystemSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = SystemSettings
        fields = '__all__'
        read_only_fields = ('id', 'updated_at', 'updated_by')


_VALID_ROLES = {code for code, _label in LDAP_USER_TYPE_CHOICES}
_VALID_PROVIDERS = {code for code, _label in LdapConfig.PROVIDER_CHOICES}


class LdapConfigSerializer(serializers.ModelSerializer):
    """Serializer para la configuración de autenticación externa.

    Cubre todos los campos de todos los proveedores (LDAP, HTTP API, …).
    Las validaciones inter-campo son condicionales al `provider` elegido:
    solo se exigen los campos relevantes al proveedor activo.

    NO expone ningún campo de password — los secrets (bind password LDAP,
    bearer token HTTP) se leen de variables de entorno.
    """

    class Meta:
        model = LdapConfig
        fields = (
            'id',
            # activación / proveedor
            'enabled', 'provider',
            # LDAP — conexión
            'server_uri', 'use_start_tls', 'connect_timeout', 'tls_require_cert',
            # LDAP — bind
            'bind_dn',
            # LDAP — búsqueda usuarios
            'user_search_base', 'user_search_filter',
            'attr_username', 'attr_email', 'attr_first_name',
            'attr_last_name', 'attr_id_card',
            # LDAP — grupos
            'group_search_base', 'group_search_filter', 'group_type',
            # HTTP API — conexión
            'http_api_base_url', 'http_api_login_path', 'http_api_method',
            'http_api_username_field', 'http_api_password_field',
            'http_api_extra_headers', 'http_api_verify_ssl', 'http_api_timeout',
            # HTTP API — mapeo respuesta
            'http_api_success_field', 'http_api_user_path',
            'http_api_attr_username', 'http_api_attr_email',
            'http_api_attr_first_name', 'http_api_attr_last_name',
            'http_api_attr_id_card', 'http_api_groups_path',
            # mapeo / roles (común a todos los providers)
            'group_to_role_map', 'default_role',
            'make_staff_groups', 'make_superuser_groups',
            # comportamiento (común)
            'auto_create_users', 'fallback_to_local', 'sync_on_login',
            # estado test (solo lectura)
            'last_test_at', 'last_test_ok', 'last_test_message',
            # audit
            'updated_at', 'updated_by',
        )
        read_only_fields = (
            'id',
            'last_test_at', 'last_test_ok', 'last_test_message',
            'updated_at', 'updated_by',
        )

    # ---------------------------------------------------- per-field validators

    def validate_provider(self, value: str) -> str:
        if value not in _VALID_PROVIDERS:
            raise serializers.ValidationError(
                f'Proveedor "{value}" no soportado. '
                f'Permitidos: {sorted(_VALID_PROVIDERS)}'
            )
        return value

    def validate_user_search_filter(self, value: str) -> str:
        if value.count('%(user)s') != 1:
            raise serializers.ValidationError(
                'El filtro debe contener exactamente un %(user)s como placeholder.'
            )
        return value

    def validate_tls_require_cert(self, value: str) -> str:
        if value == 'never' and not django_settings.DEBUG:
            raise serializers.ValidationError(
                'tls_require_cert="never" no está permitido fuera de DEBUG. '
                'Use "demand" o "hard" en producción.'
            )
        return value

    def validate_group_to_role_map(self, value):
        if not isinstance(value, dict):
            raise serializers.ValidationError('Debe ser un objeto JSON.')
        for key, role in value.items():
            if not isinstance(key, str) or not key.strip():
                raise serializers.ValidationError(
                    'Cada clave debe ser un string no vacío (DN para LDAP o '
                    'nombre de rol para HTTP API).'
                )
            if role not in _VALID_ROLES:
                raise serializers.ValidationError(
                    f'Rol inválido para "{key}": "{role}". '
                    f'Permitidos: {sorted(_VALID_ROLES)}.'
                )
        return value

    def _validate_str_list(self, value, field_name):
        if not isinstance(value, list):
            raise serializers.ValidationError('Debe ser una lista de strings.')
        for item in value:
            if not isinstance(item, str) or not item.strip():
                raise serializers.ValidationError(
                    f'{field_name}: cada elemento debe ser un string no vacío.'
                )
        return value

    def validate_make_staff_groups(self, value):
        return self._validate_str_list(value, 'make_staff_groups')

    def validate_make_superuser_groups(self, value):
        return self._validate_str_list(value, 'make_superuser_groups')

    def validate_http_api_base_url(self, value: str) -> str:
        if value and not value.lower().startswith(('http://', 'https://')):
            raise serializers.ValidationError(
                'http_api_base_url debe empezar con http:// o https://'
            )
        if value.lower().startswith('http://') and not django_settings.DEBUG:
            raise serializers.ValidationError(
                'http_api_base_url=http:// (no TLS) no está permitido fuera de DEBUG.'
            )
        return value

    def validate_http_api_extra_headers(self, value):
        if not isinstance(value, dict):
            raise serializers.ValidationError('Debe ser un objeto JSON.')
        for key in value.keys():
            if not isinstance(key, str) or not key.strip():
                raise serializers.ValidationError('Cada header debe tener nombre no vacío.')
            if key.lower() == 'authorization':
                raise serializers.ValidationError(
                    'No incluir "Authorization" aquí. Usa la variable de entorno '
                    'EXTERNAL_AUTH_HTTP_API_TOKEN para el bearer token.'
                )
        return value

    # ----------------------------------------------------- inter-field validate

    def validate(self, attrs):
        instance = self.instance
        enabled = attrs.get('enabled', instance.enabled if instance else False)
        provider = attrs.get('provider', instance.provider if instance else LdapConfig.PROVIDER_LDAP)

        if enabled and provider == LdapConfig.PROVIDER_LDAP:
            server_uri = attrs.get('server_uri', instance.server_uri if instance else '')
            user_search_base = attrs.get(
                'user_search_base',
                instance.user_search_base if instance else '',
            )
            if not server_uri:
                raise serializers.ValidationError(
                    {'server_uri': 'Requerido cuando provider=ldap y enabled=True.'}
                )
            if not user_search_base:
                raise serializers.ValidationError(
                    {'user_search_base': 'Requerido cuando provider=ldap y enabled=True.'}
                )

        if enabled and provider == LdapConfig.PROVIDER_HTTP_API:
            base_url = attrs.get(
                'http_api_base_url',
                instance.http_api_base_url if instance else '',
            )
            if not base_url:
                raise serializers.ValidationError(
                    {'http_api_base_url': 'Requerido cuando provider=http_api y enabled=True.'}
                )

        return attrs
