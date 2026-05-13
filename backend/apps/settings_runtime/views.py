import os

from django.utils import timezone
from rest_framework import permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.audit.services import log_event
from apps.platform.auth.ldap_test import run_external_auth_test
from apps.platform.permissions import IsSuperUser

from .models import LdapConfig, SystemSettings
from .serializers import LdapConfigSerializer, SystemSettingsSerializer


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def public_settings(request):
    """Devuelve sólo los campos que el frontend necesita mostrar sin auth."""
    s = SystemSettings.load()
    return Response({
        'institution_name': s.institution_name,
        'institution_short_name': s.institution_short_name,
        'institution_address': s.institution_address,
        'institution_website': s.institution_website,
        'support_email': s.support_email,
        'modules': {
            'internal': s.module_internal_enabled,
            'secretary': s.module_secretary_enabled,
            'labs': s.module_labs_enabled,
            'news': s.module_news_enabled,
        },
        'reservation': {
            'min_minutes': s.reservation_min_minutes,
            'max_minutes': s.reservation_max_minutes,
            'open_hour': s.reservation_open_hour,
            'close_hour': s.reservation_close_hour,
            'advance_days': s.reservation_advance_days,
        },
    })


class SystemSettingsView(APIView):
    """GET/PATCH de la configuración completa (solo staff)."""
    permission_classes = [permissions.IsAuthenticated, permissions.IsAdminUser]

    def get(self, request):
        s = SystemSettings.load()
        return Response(SystemSettingsSerializer(s).data)

    def patch(self, request):
        s = SystemSettings.load()
        serializer = SystemSettingsSerializer(s, data=request.data, partial=True)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        serializer.save(updated_by=request.user)
        log_event(
            action='update',
            resource=s,
            description='Configuración actualizada',
            metadata={'keys': list(request.data.keys())},
        )
        return Response(serializer.data)


class LdapConfigView(APIView):
    """GET/PATCH de la configuración de autenticación externa (solo superuser).

    Soporta múltiples proveedores (LDAP, HTTP API, …). Los secrets (bind
    password LDAP, bearer token HTTP) NO se exponen aquí: se configuran
    vía variables de entorno (`LDAP_BIND_PASSWORD`,
    `EXTERNAL_AUTH_HTTP_API_TOKEN`).
    """
    permission_classes = [permissions.IsAuthenticated, IsSuperUser]

    def get(self, request):
        cfg = LdapConfig.load()
        data = LdapConfigSerializer(cfg).data
        data['bind_password_present'] = bool(os.getenv('LDAP_BIND_PASSWORD'))
        data['http_api_token_present'] = bool(os.getenv('EXTERNAL_AUTH_HTTP_API_TOKEN'))
        return Response(data)

    def patch(self, request):
        cfg = LdapConfig.load()
        serializer = LdapConfigSerializer(cfg, data=request.data, partial=True)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        serializer.save(updated_by=request.user)
        LdapConfig.invalidate_cache()
        log_event(
            action='update',
            resource=cfg,
            description='Configuración de autenticación externa actualizada',
            metadata={'keys': list(request.data.keys())},
        )
        return Response(serializer.data)


class LdapTestConnectionView(APIView):
    """Prueba la configuración del proveedor activo (solo superuser).

    El body es opcional y permite **probar sin guardar** sobrescribiendo
    cualquier campo de configuración:

    LDAP overrides:
        server_uri, bind_dn, bind_password, test_username, test_password

    HTTP API overrides:
        http_api_base_url, http_api_login_path, http_api_method,
        http_api_username_field, http_api_password_field,
        http_api_extra_headers, test_username, test_password

    Los secrets (`bind_password`, `test_password`) NUNCA se persisten.
    """
    permission_classes = [permissions.IsAuthenticated, IsSuperUser]

    # Whitelist de claves permitidas en el body para evitar inyectar
    # overrides arbitrarios al provider.
    _ALLOWED_OVERRIDES = {
        # LDAP
        'server_uri', 'bind_dn', 'bind_password',
        'user_search_base', 'user_search_filter',
        'group_search_base', 'group_search_filter',
        # HTTP API
        'http_api_base_url', 'http_api_login_path', 'http_api_method',
        'http_api_username_field', 'http_api_password_field',
        'http_api_extra_headers',
        # Comunes
        'test_username', 'test_password',
    }

    def post(self, request):
        cfg = LdapConfig.load()
        body = request.data or {}
        overrides = {k: v for k, v in body.items() if k in self._ALLOWED_OVERRIDES}

        result = run_external_auth_test(**overrides)

        # Persistir último resultado (sin password ni datos personales en metadata)
        cfg.last_test_at = timezone.now()
        cfg.last_test_ok = bool(result['ok'])
        cfg.last_test_message = result.get('message', '')[:5000]
        cfg.save(update_fields=['last_test_at', 'last_test_ok', 'last_test_message'])
        LdapConfig.invalidate_cache()

        log_event(
            action='other',
            resource=cfg,
            description=f'Test de autenticación externa ({cfg.provider})',
            metadata={
                'provider': cfg.provider,
                'ok': result['ok'],
                'bind_ok': result.get('bind_ok'),
                'user_dn': result.get('user_dn'),
                'status': result.get('status'),
                'groups_count': len(result.get('groups') or []),
                'message': result.get('message', '')[:300],
            },
        )

        http_status = status.HTTP_200_OK if result['ok'] else status.HTTP_400_BAD_REQUEST
        return Response(result, status=http_status)
