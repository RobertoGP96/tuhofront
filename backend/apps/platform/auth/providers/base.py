"""Contrato común para proveedores de autenticación externa.

Cualquier proveedor (LDAP, HTTP API, OAuth2, SAML, ...) debe heredar de
`ExternalAuthProvider` y devolver instancias de `AuthResult` y `TestResult`.
El backend Django (`RuntimeLdapBackend`) se encarga de:

- Buscar/crear el `User` local a partir del `AuthResult`.
- Sincronizar atributos (nombre, email, id_card) si `sync_on_login=True`.
- Mapear grupos → `user_type` / `is_staff` / `is_superuser`.
- Auditoría.

De este modo, los proveedores NO necesitan saber nada del modelo `User`
ni de Django: solo devuelven una estructura de datos.
"""
from __future__ import annotations

from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import Any


@dataclass
class AuthResult:
    """Resultado de una autenticación exitosa contra el proveedor externo."""

    username: str
    email: str = ''
    first_name: str = ''
    last_name: str = ''
    id_card: str = ''
    # Foto de perfil opcional. Puede ser un data URL base64
    # (`data:image/png;base64,...`) o una URL externa. Solo se persiste si
    # el proveedor la suministra; los proveedores que no la soporten dejan
    # el default vacío y `User.personal_photo` queda en blanco.
    personal_photo: str = ''
    # Identificadores de grupos/roles tal como los devuelve el proveedor.
    # Para LDAP son DNs completos. Para HTTP API son strings arbitrarios
    # (ej. "profesor", "admin"). El mapeo a `user_type` se hace en el backend.
    groups: list[str] = field(default_factory=list)
    # Datos crudos del proveedor para debugging/auditoría.
    raw: dict[str, Any] = field(default_factory=dict)


@dataclass
class TestResult:
    """Resultado de probar la configuración del proveedor."""

    ok: bool
    message: str
    # Detalles específicos del proveedor (DN del usuario, status HTTP, etc.).
    details: dict[str, Any] = field(default_factory=dict)


class ExternalAuthProvider(ABC):
    """Contrato común para proveedores de autenticación externa.

    Cada proveedor recibe la configuración (`LdapConfig`) en su constructor
    y se mantiene stateless entre llamadas. La instancia se descarta
    después de cada `authenticate()` o `test()`.
    """

    def __init__(self, cfg):
        self.cfg = cfg

    @abstractmethod
    def authenticate(self, username: str, password: str, *, request=None) -> AuthResult | None:
        """Valida credenciales contra el sistema externo.

        Returns:
            `AuthResult` si las credenciales son válidas.
            `None` si son inválidas o el proveedor no puede operar
            (configuración incompleta, librería no instalada, etc.).

        Raises:
            No debe propagar excepciones por errores transitorios de red.
            El backend Django captura excepciones y las traduce a `None`
            cuando `fallback_to_local=True`.
        """

    @abstractmethod
    def test(self, **overrides: Any) -> TestResult:
        """Prueba la configuración sin afectar usuarios reales.

        `overrides` permite sobrescribir campos de configuración para
        probar valores propuestos sin guardarlos (útil para el panel admin).
        Acepta `test_username` y `test_password` para probar credenciales
        de un usuario concreto.
        """
