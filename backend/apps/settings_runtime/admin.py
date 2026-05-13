from django.contrib import admin

from .models import LdapConfig, SystemSettings


@admin.register(SystemSettings)
class SystemSettingsAdmin(admin.ModelAdmin):
    list_display = ('institution_name', 'institution_short_name', 'updated_at', 'updated_by')
    readonly_fields = ('updated_at', 'updated_by')

    def has_add_permission(self, request):
        # Singleton: evita añadir un segundo
        return not SystemSettings.objects.exists()

    def has_delete_permission(self, request, obj=None):
        return False


@admin.register(LdapConfig)
class LdapConfigAdmin(admin.ModelAdmin):
    list_display = ('enabled', 'provider', 'last_test_ok', 'last_test_at', 'updated_at')
    list_filter = ('enabled', 'provider')
    readonly_fields = (
        'last_test_at', 'last_test_ok', 'last_test_message',
        'updated_at', 'updated_by',
    )
    fieldsets = (
        ('Activación', {
            'fields': ('enabled', 'provider'),
            'description': (
                'Aunque la tabla se llama <code>LdapConfig</code> por compatibilidad, '
                'este registro soporta múltiples proveedores (LDAP directo, API HTTP REST, …). '
                'Selecciona el provider y completa solo los campos relevantes.'
            ),
        }),
        ('LDAP — Conexión', {
            'fields': (
                'server_uri', 'use_start_tls', 'connect_timeout', 'tls_require_cert',
            ),
            'classes': ('collapse',),
        }),
        ('LDAP — Bind', {
            'fields': ('bind_dn',),
            'description': (
                'El password del bind DN se configura mediante la variable de '
                'entorno <code>LDAP_BIND_PASSWORD</code> y no se almacena aquí.'
            ),
            'classes': ('collapse',),
        }),
        ('LDAP — Búsqueda de usuarios', {
            'fields': (
                'user_search_base', 'user_search_filter',
                'attr_username', 'attr_email',
                'attr_first_name', 'attr_last_name',
                'attr_id_card',
            ),
            'classes': ('collapse',),
        }),
        ('LDAP — Grupos', {
            'fields': (
                'group_search_base', 'group_search_filter', 'group_type',
            ),
            'classes': ('collapse',),
        }),
        ('HTTP API — Conexión', {
            'fields': (
                'http_api_base_url', 'http_api_login_path', 'http_api_method',
                'http_api_verify_ssl', 'http_api_timeout',
                'http_api_extra_headers',
            ),
            'description': (
                'Endpoint REST contra el que se autenticará al usuario. '
                'El token opcional (Authorization: Bearer ...) se inyecta '
                'desde <code>EXTERNAL_AUTH_HTTP_API_TOKEN</code>.'
            ),
            'classes': ('collapse',),
        }),
        ('HTTP API — Petición', {
            'fields': (
                'http_api_username_field', 'http_api_password_field',
            ),
            'classes': ('collapse',),
        }),
        ('HTTP API — Mapeo de respuesta', {
            'fields': (
                'http_api_success_field', 'http_api_user_path',
                'http_api_attr_username', 'http_api_attr_email',
                'http_api_attr_first_name', 'http_api_attr_last_name',
                'http_api_attr_id_card', 'http_api_groups_path',
            ),
            'classes': ('collapse',),
        }),
        ('Mapeo de roles (común a todos los providers)', {
            'fields': (
                'group_to_role_map', 'default_role',
                'make_staff_groups', 'make_superuser_groups',
            ),
        }),
        ('Comportamiento (común)', {
            'fields': (
                'auto_create_users', 'fallback_to_local', 'sync_on_login',
            ),
        }),
        ('Estado del último test', {
            'fields': ('last_test_at', 'last_test_ok', 'last_test_message'),
        }),
        ('Audit', {'fields': ('updated_at', 'updated_by')}),
    )

    def has_add_permission(self, request):
        # Singleton
        return not LdapConfig.objects.exists()

    def has_delete_permission(self, request, obj=None):
        return False
