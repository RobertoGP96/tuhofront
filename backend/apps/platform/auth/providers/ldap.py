"""Proveedor LDAP usando python-ldap directamente (sin django-auth-ldap).

Patrón estándar **search-bind**:
1. Conectar al servidor LDAP.
2. Bind con la cuenta técnica (`bind_dn` + `LDAP_BIND_PASSWORD`) o anónimo.
3. Buscar el DN del usuario por filtro (`user_search_filter`).
4. Volver a bindear con el DN del usuario y su password (validación real).
5. Re-bindear con la cuenta técnica para leer atributos y grupos.
6. Devolver `AuthResult`.

Si `python-ldap` no está instalado en el entorno (frecuente en Windows
sin wheels precompilados), el proveedor se auto-deshabilita: devuelve
`None` en `authenticate()` y un `TestResult` con `ok=False`.
"""
from __future__ import annotations

import logging
import os
from typing import Any

from .base import AuthResult, ExternalAuthProvider, TestResult

logger = logging.getLogger(__name__)

try:
    import ldap as pyldap  # type: ignore
    from ldap.filter import escape_filter_chars  # type: ignore
    LDAP_AVAILABLE = True
    _IMPORT_ERROR = ''
except Exception as exc:  # pragma: no cover - depende del entorno
    pyldap = None  # type: ignore
    LDAP_AVAILABLE = False
    _IMPORT_ERROR = str(exc)


def _decode_attrs(attrs: dict) -> dict[str, list[str]]:
    """Convierte valores bytes → str para uso seguro en Python/JSON."""
    out: dict[str, list[str]] = {}
    for key, values in attrs.items():
        decoded: list[str] = []
        for v in values:
            if isinstance(v, bytes):
                try:
                    decoded.append(v.decode('utf-8'))
                except UnicodeDecodeError:
                    decoded.append(v.decode('latin-1', errors='replace'))
            else:
                decoded.append(str(v))
        out[key] = decoded
    return out


def _first(attrs: dict, key: str, default: str = '') -> str:
    if not key:
        return default
    values = attrs.get(key)
    if not values:
        return default
    return values[0]


class LdapProvider(ExternalAuthProvider):
    """Proveedor de autenticación contra un servidor LDAP."""

    # ------------------------------------------------------------------ connect

    def _connect(self, server_uri: str | None = None, *, use_start_tls: bool | None = None):
        if not LDAP_AVAILABLE:
            return None
        cfg = self.cfg
        uri = server_uri or cfg.server_uri
        conn = pyldap.initialize(uri, bytes_mode=False)
        conn.set_option(pyldap.OPT_REFERRALS, 0)
        conn.set_option(pyldap.OPT_NETWORK_TIMEOUT, cfg.connect_timeout)
        conn.set_option(pyldap.OPT_TIMEOUT, cfg.connect_timeout)

        require_map = {
            'never': pyldap.OPT_X_TLS_NEVER,
            'allow': pyldap.OPT_X_TLS_ALLOW,
            'demand': pyldap.OPT_X_TLS_DEMAND,
            'hard': pyldap.OPT_X_TLS_HARD,
        }
        if cfg.tls_require_cert in require_map:
            conn.set_option(pyldap.OPT_X_TLS_REQUIRE_CERT, require_map[cfg.tls_require_cert])

        ca_file = os.getenv('LDAP_TLS_CA_CERTFILE')
        if ca_file:
            conn.set_option(pyldap.OPT_X_TLS_CACERTFILE, ca_file)

        if (use_start_tls if use_start_tls is not None else cfg.use_start_tls):
            conn.start_tls_s()
        return conn

    # -------------------------------------------------------------- authenticate

    def authenticate(self, username: str, password: str, *, request=None) -> AuthResult | None:
        if not LDAP_AVAILABLE:
            return None
        cfg = self.cfg
        if not cfg.server_uri or not cfg.user_search_base:
            return None
        if not username or not password:
            return None

        conn = None
        try:
            conn = self._connect()
            # 1) Bind técnico para buscar
            if cfg.bind_dn:
                conn.simple_bind_s(cfg.bind_dn, os.getenv('LDAP_BIND_PASSWORD', ''))
            else:
                conn.simple_bind_s()

            # 2) Buscar al usuario
            escaped = escape_filter_chars(username)
            user_filter = cfg.user_search_filter.replace('%(user)s', escaped)
            results = conn.search_s(
                cfg.user_search_base,
                pyldap.SCOPE_SUBTREE,
                user_filter,
            )
            if not results:
                return None
            user_dn, raw_attrs = results[0]
            attrs = _decode_attrs(raw_attrs)

            # 3) Validar password rebindeando como el usuario
            try:
                conn.simple_bind_s(user_dn, password)
            except pyldap.INVALID_CREDENTIALS:
                return None

            # 4) Re-bindear como técnico para grupos
            if cfg.bind_dn:
                try:
                    conn.simple_bind_s(cfg.bind_dn, os.getenv('LDAP_BIND_PASSWORD', ''))
                except Exception:
                    pass

            groups: list[str] = []
            if cfg.group_search_base:
                member_filter = (
                    f'(|(member={user_dn})(uniqueMember={user_dn})'
                    f'(memberUid={escaped}))'
                )
                group_results = conn.search_s(
                    cfg.group_search_base,
                    pyldap.SCOPE_SUBTREE,
                    f'(&{cfg.group_search_filter}{member_filter})',
                    attrlist=['cn'],
                )
                groups = [dn for dn, _ in group_results]

            return AuthResult(
                username=username,
                email=_first(attrs, cfg.attr_email),
                first_name=_first(attrs, cfg.attr_first_name),
                last_name=_first(attrs, cfg.attr_last_name),
                id_card=_first(attrs, cfg.attr_id_card) if cfg.attr_id_card else '',
                groups=groups,
                raw={'dn': user_dn, 'attrs': attrs},
            )
        except pyldap.LDAPError as exc:
            logger.warning('LdapProvider error during authenticate: %s', exc)
            return None
        finally:
            if conn is not None:
                try:
                    conn.unbind_s()
                except Exception:
                    pass

    # ---------------------------------------------------------------------- test

    def test(self, **overrides: Any) -> TestResult:
        if not LDAP_AVAILABLE:
            return TestResult(
                ok=False,
                message=f'python-ldap no instalado: {_IMPORT_ERROR}',
                details={'provider': 'ldap'},
            )

        cfg = self.cfg
        server_uri = overrides.get('server_uri') or cfg.server_uri
        bind_dn = overrides.get('bind_dn') or cfg.bind_dn
        bind_password = overrides.get('bind_password') or os.getenv('LDAP_BIND_PASSWORD', '')
        test_username = overrides.get('test_username')
        test_password = overrides.get('test_password')

        if not server_uri:
            return TestResult(ok=False, message='server_uri vacío',
                              details={'provider': 'ldap'})

        conn = None
        try:
            conn = self._connect(server_uri=server_uri)
            if bind_dn:
                conn.simple_bind_s(bind_dn, bind_password)
            else:
                conn.simple_bind_s()
            details: dict[str, Any] = {'provider': 'ldap', 'bind_ok': True}

            if test_username and cfg.user_search_base:
                escaped = escape_filter_chars(test_username)
                user_filter = cfg.user_search_filter.replace('%(user)s', escaped)
                results = conn.search_s(
                    cfg.user_search_base,
                    pyldap.SCOPE_SUBTREE,
                    user_filter,
                )
                if not results:
                    return TestResult(
                        ok=False,
                        message=f'Usuario "{test_username}" no encontrado',
                        details=details,
                    )
                user_dn, raw_attrs = results[0]
                details['user_dn'] = user_dn
                details['user_attrs'] = _decode_attrs(raw_attrs)

                # Validación opcional de password
                if test_password:
                    try:
                        conn.simple_bind_s(user_dn, test_password)
                        details['user_password_ok'] = True
                    except pyldap.INVALID_CREDENTIALS:
                        return TestResult(
                            ok=False,
                            message='Bind ok pero el password del usuario es inválido',
                            details=details,
                        )

                if cfg.group_search_base:
                    member_filter = (
                        f'(|(member={user_dn})(uniqueMember={user_dn})'
                        f'(memberUid={escaped}))'
                    )
                    group_results = conn.search_s(
                        cfg.group_search_base,
                        pyldap.SCOPE_SUBTREE,
                        f'(&{cfg.group_search_filter}{member_filter})',
                        attrlist=['cn'],
                    )
                    details['groups'] = [dn for dn, _ in group_results]

                return TestResult(
                    ok=True,
                    message=f'Bind ok; usuario encontrado: {user_dn}',
                    details=details,
                )

            return TestResult(ok=True, message='Bind exitoso.', details=details)
        except Exception as exc:
            logger.warning('LdapProvider test failed: %s', exc)
            return TestResult(
                ok=False,
                message=f'{type(exc).__name__}: {exc}',
                details={'provider': 'ldap'},
            )
        finally:
            if conn is not None:
                try:
                    conn.unbind_s()
                except Exception:
                    pass
