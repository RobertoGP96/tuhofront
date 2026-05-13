"""Backend Django de autenticación externa, dispatcher de proveedores.

Aunque este módulo se llama `ldap.py` por compatibilidad con la primera
iteración del feature, la clase `RuntimeLdapBackend` ahora soporta
**cualquier proveedor externo** registrado en
`apps.platform.auth.providers.PROVIDER_REGISTRY`:

- LDAP directo (`LdapProvider`)
- API HTTP REST (`HttpApiProvider`)
- … futuros: OAuth2, SAML, OpenID Connect

El proveedor concreto se selecciona vía `LdapConfig.provider` y se carga
desde caché (5 min) en cada `authenticate()`.

### Flujo

1. Si `LdapConfig.enabled=False` → retornar `None` (cede a ModelBackend).
2. Resolver provider con `get_provider(cfg)`.
3. Llamar `provider.authenticate(username, password)` → `AuthResult | None`.
4. Si éxito, buscar/crear `User` local desde el `AuthResult`.
5. Sincronizar atributos (si `sync_on_login=True`).
6. Mapear grupos → `user_type` / `is_staff` / `is_superuser` con
   `group_to_role_map`.
7. Auditar cambios (`apps.audit.services.log_event`).

### Por qué este backend siempre está registrado

`AUTHENTICATION_BACKENDS` en `settings.py` lo incluye SIEMPRE. El backend
se auto-deshabilita devolviendo `None` cuando no debe actuar. Esto evita
tener que mutar `AUTHENTICATION_BACKENDS` en runtime (lo cual no es
thread-safe entre workers de gunicorn).
"""
from __future__ import annotations

import logging
import random
from typing import Optional

from apps.settings_runtime.models import LdapConfig

logger = logging.getLogger(__name__)


class RuntimeLdapBackend:
    """Backend Django para autenticación externa configurable en runtime.

    El nombre se mantiene por compatibilidad con `AUTHENTICATION_BACKENDS`
    en `settings.py`. Conceptualmente equivale a un
    `RuntimeExternalAuthBackend`.
    """

    # Django llama a este método con `username`/`password` en kwargs.
    def authenticate(self, request, username=None, password=None, **kwargs):
        if not username or not password:
            return None

        cfg = LdapConfig.load()
        if not cfg.enabled:
            return None

        # Lazy import para evitar ciclo apps.platform <-> apps.settings_runtime.
        from .providers import get_provider

        provider = get_provider(cfg)
        if provider is None:
            return None

        try:
            result = provider.authenticate(username, password, request=request)
        except Exception as exc:  # pragma: no cover - defensa contra bugs del provider
            logger.exception('Provider %s raised: %s', cfg.provider, exc)
            return None

        if result is None:
            return None

        try:
            user = self._resolve_user(result, cfg)
        except Exception as exc:  # pragma: no cover
            logger.exception('Error resolviendo usuario para %s: %s', username, exc)
            return None

        if user is not None and cfg.sync_on_login:
            try:
                self._sync_role(user, result.groups, cfg)
            except Exception as exc:  # pragma: no cover
                logger.exception('Error sincronizando rol para %s: %s', username, exc)
        return user

    def get_user(self, user_id):
        from apps.platform.models.user import User
        try:
            return User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return None

    # ------------------------------------------------- user resolve / creation

    def _resolve_user(self, result, cfg: LdapConfig):
        """Busca o crea el `User` local a partir del `AuthResult`."""
        from apps.platform.models.user import User

        try:
            user = User.objects.get(username=result.username)
            created = False
        except User.DoesNotExist:
            if not cfg.auto_create_users:
                return None
            user = User(username=result.username)
            user.email = result.email
            user.first_name = result.first_name
            user.last_name = result.last_name
            user.user_type = cfg.default_role
            user.id_card = result.id_card or self._generate_placeholder_id_card()
            user.set_unusable_password()
            user.save()
            created = True

        # Sincronización de atributos en cada login
        if cfg.sync_on_login and not created:
            changed = []
            if result.email and user.email != result.email:
                user.email = result.email
                changed.append('email')
            if result.first_name and user.first_name != result.first_name:
                user.first_name = result.first_name
                changed.append('first_name')
            if result.last_name and user.last_name != result.last_name:
                user.last_name = result.last_name
                changed.append('last_name')
            if result.id_card and not user.id_card:
                user.id_card = result.id_card
                changed.append('id_card')
            if changed:
                user.save(update_fields=changed)

        return user

    @staticmethod
    def _generate_placeholder_id_card() -> str:
        """Genera un id_card único de 11 dígitos (prefijo "9" para placeholders)."""
        from apps.platform.models.user import User
        for _ in range(20):
            candidate = '9' + ''.join(str(random.randint(0, 9)) for _ in range(10))
            if not User.objects.filter(id_card=candidate).exists():
                return candidate
        raise RuntimeError('No se pudo generar id_card placeholder único.')

    # ----------------------------------------------- grupo → rol / staff / super

    def _sync_role(self, user, groups: list[str], cfg: LdapConfig) -> None:
        """Mapea grupos externos → user_type / is_staff / is_superuser.

        `groups` puede contener DNs (LDAP) o nombres de roles (HTTP API).
        El mapeo es case-insensitive y se aplica el primer match.
        """
        groups_lower = [g.lower() for g in (groups or [])]

        old_role = user.user_type
        old_staff = bool(user.is_staff)
        old_super = bool(user.is_superuser)

        new_role: Optional[str] = None
        for key, role in (cfg.group_to_role_map or {}).items():
            if key.lower() in groups_lower:
                new_role = role
                break
        if new_role is None:
            new_role = cfg.default_role

        new_staff = any(
            key.lower() in groups_lower for key in (cfg.make_staff_groups or [])
        )
        new_super = any(
            key.lower() in groups_lower for key in (cfg.make_superuser_groups or [])
        )

        changed = []
        if user.user_type != new_role:
            user.user_type = new_role
            changed.append('user_type')
        if user.is_staff != new_staff:
            user.is_staff = new_staff
            changed.append('is_staff')
        if user.is_superuser != new_super:
            user.is_superuser = new_super
            changed.append('is_superuser')

        if changed:
            user.save(update_fields=changed)
            try:
                from apps.audit.services import log_event
                log_event(
                    action='permission_change',
                    resource=user,
                    description='Sincronización de permisos vía autenticación externa',
                    metadata={
                        'provider': cfg.provider,
                        'old': {
                            'user_type': old_role,
                            'is_staff': old_staff,
                            'is_superuser': old_super,
                        },
                        'new': {
                            'user_type': new_role,
                            'is_staff': new_staff,
                            'is_superuser': new_super,
                        },
                        'groups': groups,
                    },
                )
            except Exception as exc:  # pragma: no cover
                logger.warning('Failed to record audit log: %s', exc)


# Alias semántico para futuras renames. Si se rebautiza la clase, mantener
# `RuntimeLdapBackend = RuntimeExternalAuthBackend` aquí para no romper
# `AUTHENTICATION_BACKENDS` en settings.py.
RuntimeExternalAuthBackend = RuntimeLdapBackend


# Compatibilidad con la primera iteración (módulo `ldap_test.py`).
def LDAP_AVAILABLE() -> bool:  # pragma: no cover - usado solo en debug
    from .providers.ldap import LDAP_AVAILABLE as _flag
    return _flag
