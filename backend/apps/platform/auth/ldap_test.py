"""Helper de prueba de conexión para autenticación externa.

Mantiene la firma `ldap_test_connection(...)` por compatibilidad pero
internamente delega en el `ExternalAuthProvider` configurado en
`LdapConfig.provider` (LDAP, HTTP API, …). De este modo el endpoint
`/api/v1/settings/ldap/test/` funciona para cualquier proveedor sin
modificaciones.

Para llamar a la prueba del proveedor *configurado actualmente* sin
overrides, basta con instanciar `get_provider(cfg).test()`.
"""
from __future__ import annotations

from typing import Any

from apps.settings_runtime.models import LdapConfig


def run_external_auth_test(**overrides: Any) -> dict[str, Any]:
    """Ejecuta `provider.test(**overrides)` y devuelve un dict serializable.

    El dict incluye SIEMPRE las claves `ok` y `message`, además de
    `details` específico del proveedor. Las siguientes claves se mantienen
    al primer nivel por compatibilidad con la API previa:

    - `bind_ok` (LDAP): si el bind funcionó.
    - `user_dn` (LDAP): DN del usuario encontrado.
    - `user_attrs` (LDAP): atributos del usuario.
    - `groups`: lista de grupos resueltos.
    - `status` (HTTP API): código HTTP devuelto.
    - `extracted` (HTTP API): atributos parseados del JSON.
    """
    from .providers import get_provider

    cfg = LdapConfig.load()
    provider = get_provider(cfg)
    if provider is None:
        return {
            'ok': False,
            'message': f'Proveedor "{cfg.provider}" no implementado.',
            'details': {},
            'bind_ok': False,
            'user_dn': None,
            'user_attrs': None,
            'groups': [],
        }

    result = provider.test(**overrides)
    out: dict[str, Any] = {
        'ok': result.ok,
        'message': result.message,
        'details': result.details,
    }
    # Aplanar campos comunes a la respuesta para compatibilidad con UI previa.
    out['bind_ok'] = result.details.get('bind_ok', result.ok)
    out['user_dn'] = result.details.get('user_dn')
    out['user_attrs'] = result.details.get('user_attrs')
    out['groups'] = result.details.get('groups', [])
    if 'status' in result.details:
        out['status'] = result.details['status']
    if 'extracted' in result.details:
        out['extracted'] = result.details['extracted']
    return out


def ldap_test_connection(**kwargs: Any) -> dict[str, Any]:
    """Compat shim: traduce kwargs antiguos a `run_external_auth_test`."""
    # Mapeo de kwargs heredados (de la primera versión, solo-LDAP) →
    # nombres que entiende el provider LDAP via `test(**overrides)`.
    overrides: dict[str, Any] = {}
    if 'server_uri' in kwargs:
        overrides['server_uri'] = kwargs['server_uri']
    if 'bind_dn' in kwargs:
        overrides['bind_dn'] = kwargs['bind_dn']
    if 'bind_password' in kwargs:
        overrides['bind_password'] = kwargs['bind_password']
    if 'test_username' in kwargs:
        overrides['test_username'] = kwargs['test_username']
    if 'test_password' in kwargs:
        overrides['test_password'] = kwargs['test_password']
    return run_external_auth_test(**overrides)
