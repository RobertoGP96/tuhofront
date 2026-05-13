"""Proveedores de autenticación externa pluggables.

La arquitectura está pensada para añadir nuevos proveedores (OAuth2, SAML,
OpenID Connect, etc.) sin tocar el backend Django ni las vistas:

1. Implementar una clase que herede de `ExternalAuthProvider` (ver `base.py`).
2. Registrar el proveedor en `PROVIDER_REGISTRY` (este módulo).
3. Añadir el código nuevo a `LdapConfig.PROVIDER_CHOICES` con una migración
   `AlterField` mínima.
4. Añadir campos de configuración específicos del proveedor al modelo
   `LdapConfig` con prefijo `<provider>_<field>`.

Esto garantiza que el `RuntimeLdapBackend` y el frontend funcionen de
forma idéntica sin modificaciones.
"""
from __future__ import annotations

from apps.settings_runtime.models import LdapConfig

from .base import AuthResult, ExternalAuthProvider, TestResult
from .http_api import HttpApiProvider
from .ldap import LdapProvider


PROVIDER_REGISTRY: dict[str, type[ExternalAuthProvider]] = {
    LdapConfig.PROVIDER_LDAP: LdapProvider,
    LdapConfig.PROVIDER_HTTP_API: HttpApiProvider,
}


def get_provider(cfg: LdapConfig) -> ExternalAuthProvider | None:
    """Devuelve una instancia del proveedor configurado en `cfg.provider`.

    Devuelve `None` si el proveedor no está registrado o si la configuración
    es inválida — el backend interpreta `None` como "cede a ModelBackend".
    """
    cls = PROVIDER_REGISTRY.get(cfg.provider)
    if cls is None:
        return None
    return cls(cfg)


__all__ = [
    'AuthResult',
    'TestResult',
    'ExternalAuthProvider',
    'HttpApiProvider',
    'LdapProvider',
    'PROVIDER_REGISTRY',
    'get_provider',
]
