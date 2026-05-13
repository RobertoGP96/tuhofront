"""Proveedor de autenticación contra una API HTTP REST.

Pensado para servicios institucionales como `https://auth.uho.edu.cu` que
exponen un endpoint de login. La petición y el parseo de la respuesta son
**completamente configurables** desde el panel admin (`LdapConfig`), de modo
que el código no necesita cambiar si la institución migra a otra API con
distintos nombres de campos.

### Flujo

1. Construir URL = `http_api_base_url + http_api_login_path`.
2. Construir body con `{http_api_username_field: username,
   http_api_password_field: password}` (o query-string para GET).
3. Añadir headers `http_api_extra_headers` + `Authorization: Bearer <token>`
   si `EXTERNAL_AUTH_HTTP_API_TOKEN` está definido.
4. Enviar petición con `timeout`, `verify=verify_ssl`.
5. Determinar éxito:
   - Si `http_api_success_field` está configurado → comprobar ese campo.
   - Si no → status code 2xx = éxito.
6. Extraer el objeto user usando `http_api_user_path` (notación de punto).
7. Extraer atributos (`attr_*`) y grupos (`groups_path`).
8. Devolver `AuthResult`.

### Mocking en tests

El proveedor usa `requests` con `requests.request(...)`. Para tests se
puede mockear con `responses` o `requests_mock`.
"""
from __future__ import annotations

import logging
import os
from typing import Any

from .base import AuthResult, ExternalAuthProvider, TestResult

logger = logging.getLogger(__name__)

try:
    import requests  # type: ignore
    REQUESTS_AVAILABLE = True
    _IMPORT_ERROR = ''
except Exception as exc:  # pragma: no cover - depende del entorno
    requests = None  # type: ignore
    REQUESTS_AVAILABLE = False
    _IMPORT_ERROR = str(exc)


# ---------------------------------------------------------------- path helpers


def _walk_path(data: Any, path: str) -> Any:
    """Camina un JSON usando notación de punto. Path vacío = raíz."""
    if not path:
        return data
    current: Any = data
    for segment in path.split('.'):
        if isinstance(current, dict):
            current = current.get(segment)
        elif isinstance(current, list):
            try:
                current = current[int(segment)]
            except (ValueError, IndexError):
                return None
        else:
            return None
        if current is None:
            return None
    return current


def _stringify(value: Any) -> str:
    if value is None:
        return ''
    return str(value)


def _groups_from(value: Any) -> list[str]:
    """Normaliza la respuesta de grupos: acepta lista de strings o de dicts."""
    if value is None:
        return []
    if isinstance(value, list):
        out: list[str] = []
        for item in value:
            if isinstance(item, str):
                out.append(item)
            elif isinstance(item, dict):
                # Caso común: {"name": "profesor"} o {"role": "profesor"}
                for key in ('name', 'role', 'code', 'slug', 'id'):
                    if key in item:
                        out.append(_stringify(item[key]))
                        break
        return out
    if isinstance(value, str):
        return [value]
    return []


# ------------------------------------------------------------------ provider


class HttpApiProvider(ExternalAuthProvider):
    """Proveedor de autenticación contra una API HTTP REST."""

    def _build_request(self, username: str, password: str, **overrides: Any) -> dict[str, Any]:
        cfg = self.cfg
        base_url = (overrides.get('http_api_base_url') or cfg.http_api_base_url).rstrip('/')
        path = overrides.get('http_api_login_path') or cfg.http_api_login_path
        url = base_url + (path if path.startswith('/') else f'/{path}')
        method = (overrides.get('http_api_method') or cfg.http_api_method or 'POST').upper()
        user_field = overrides.get('http_api_username_field') or cfg.http_api_username_field
        pwd_field = overrides.get('http_api_password_field') or cfg.http_api_password_field

        headers: dict[str, str] = {'Accept': 'application/json'}
        extra_headers = overrides.get('http_api_extra_headers')
        if extra_headers is None:
            extra_headers = cfg.http_api_extra_headers or {}
        headers.update({str(k): str(v) for k, v in (extra_headers or {}).items()})

        token = os.getenv('EXTERNAL_AUTH_HTTP_API_TOKEN')
        if token:
            headers.setdefault('Authorization', f'Bearer {token}')

        body = {user_field: username, pwd_field: password}

        return {
            'method': method,
            'url': url,
            'headers': headers,
            'body': body,
            'verify': cfg.http_api_verify_ssl,
            'timeout': cfg.http_api_timeout,
        }

    def _send(self, req: dict[str, Any]):
        if not REQUESTS_AVAILABLE:
            return None
        kwargs: dict[str, Any] = {
            'headers': req['headers'],
            'timeout': req['timeout'],
            'verify': req['verify'],
        }
        if req['method'] == 'GET':
            kwargs['params'] = req['body']
        else:
            headers = dict(req['headers'])
            headers.setdefault('Content-Type', 'application/json')
            kwargs['headers'] = headers
            kwargs['json'] = req['body']
        return requests.request(req['method'], req['url'], **kwargs)

    def _is_success(self, response, payload: Any) -> bool:
        cfg = self.cfg
        if cfg.http_api_success_field:
            value = _walk_path(payload, cfg.http_api_success_field)
            if isinstance(value, bool):
                return value
            if isinstance(value, str):
                return value.lower() in ('true', 'ok', 'success', '1')
            return False
        return 200 <= response.status_code < 300

    def _to_auth_result(self, payload: Any, fallback_username: str) -> AuthResult | None:
        cfg = self.cfg
        user_obj = _walk_path(payload, cfg.http_api_user_path) if cfg.http_api_user_path else payload
        if not isinstance(user_obj, dict):
            # La API marcó éxito pero no devolvió un objeto user → usamos
            # solo el username supuesto.
            return AuthResult(username=fallback_username, raw=payload if isinstance(payload, dict) else {})

        groups_value = (
            _walk_path(payload, cfg.http_api_groups_path)
            if cfg.http_api_groups_path
            else None
        )
        return AuthResult(
            username=_stringify(user_obj.get(cfg.http_api_attr_username)) or fallback_username,
            email=_stringify(user_obj.get(cfg.http_api_attr_email)),
            first_name=_stringify(user_obj.get(cfg.http_api_attr_first_name)),
            last_name=_stringify(user_obj.get(cfg.http_api_attr_last_name)),
            id_card=(
                _stringify(user_obj.get(cfg.http_api_attr_id_card))
                if cfg.http_api_attr_id_card else ''
            ),
            groups=_groups_from(groups_value),
            raw=user_obj if isinstance(user_obj, dict) else {},
        )

    # -------------------------------------------------------------- authenticate

    def authenticate(self, username: str, password: str, *, request=None) -> AuthResult | None:
        if not REQUESTS_AVAILABLE:
            logger.warning('requests no instalado, HttpApiProvider inactivo')
            return None
        cfg = self.cfg
        if not cfg.http_api_base_url:
            return None
        if not username or not password:
            return None

        try:
            req = self._build_request(username, password)
            response = self._send(req)
        except Exception as exc:  # red, DNS, TLS, etc.
            logger.warning('HttpApiProvider request failed: %s', exc)
            return None

        if response is None:
            return None

        try:
            payload = response.json()
        except Exception:
            payload = {}

        if not self._is_success(response, payload):
            return None

        return self._to_auth_result(payload, fallback_username=username)

    # ---------------------------------------------------------------------- test

    def test(self, **overrides: Any) -> TestResult:
        if not REQUESTS_AVAILABLE:
            return TestResult(
                ok=False,
                message=f'La librería "requests" no está instalada: {_IMPORT_ERROR}',
                details={'provider': 'http_api'},
            )
        cfg = self.cfg
        base_url = overrides.get('http_api_base_url') or cfg.http_api_base_url
        if not base_url:
            return TestResult(
                ok=False,
                message='http_api_base_url vacío',
                details={'provider': 'http_api'},
            )

        test_username = overrides.get('test_username')
        test_password = overrides.get('test_password')
        if not test_username or not test_password:
            # Sin credenciales solo probamos que el endpoint responde.
            try:
                req = self._build_request('', '', **overrides)
                response = self._send(req)
                if response is None:
                    return TestResult(ok=False, message='Sin respuesta HTTP',
                                      details={'provider': 'http_api'})
                return TestResult(
                    ok=True,
                    message=(
                        f'Endpoint accesible (status {response.status_code}). '
                        'Proporciona test_username y test_password para validar el login.'
                    ),
                    details={
                        'provider': 'http_api',
                        'url': req['url'],
                        'status': response.status_code,
                    },
                )
            except Exception as exc:
                return TestResult(
                    ok=False,
                    message=f'{type(exc).__name__}: {exc}',
                    details={'provider': 'http_api'},
                )

        try:
            req = self._build_request(test_username, test_password, **overrides)
            response = self._send(req)
        except Exception as exc:
            return TestResult(
                ok=False,
                message=f'{type(exc).__name__}: {exc}',
                details={'provider': 'http_api'},
            )

        if response is None:
            return TestResult(ok=False, message='Sin respuesta HTTP',
                              details={'provider': 'http_api'})

        try:
            payload = response.json()
        except Exception:
            payload = {}

        success = self._is_success(response, payload)
        details: dict[str, Any] = {
            'provider': 'http_api',
            'url': req['url'],
            'status': response.status_code,
            'success': success,
        }
        if not success:
            return TestResult(
                ok=False,
                message=f'Endpoint respondió status {response.status_code} sin marcar éxito',
                details=details,
            )

        result = self._to_auth_result(payload, fallback_username=test_username)
        if result:
            details['extracted'] = {
                'username': result.username,
                'email': result.email,
                'first_name': result.first_name,
                'last_name': result.last_name,
                'groups': result.groups,
            }
        return TestResult(
            ok=True,
            message=f'Login OK (status {response.status_code}).',
            details=details,
        )
