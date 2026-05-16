"""Tests del provider HTTP API contra la respuesta real de ``auth.uho.edu.cu``.

Valida que ``HttpApiProvider`` parsea correctamente la forma de la respuesta
documentada en ``docs/EXTERNAL_AUTH.md`` §3.2.1, incluyendo:

- Resolución de atributos con paths anidados (notación de punto).
- Sintetización de email con plantilla cuando la API no devuelve uno.
- Extracción de la foto de perfil (data URL base64).
- Mapeo de grupos cuando la respuesta solo tiene un string suelto.

Estos tests usan ``unittest.mock.patch`` sobre ``requests.request`` y no
requieren conectividad ni dependencias externas.

Ejecutar con::

    python manage.py test apps.platform.test.test_http_api_uho
"""
from __future__ import annotations

from contextlib import contextmanager
from types import SimpleNamespace
from unittest.mock import MagicMock, patch

from django.test import TestCase

from apps.platform.auth.providers import http_api as http_api_module
from apps.platform.auth.providers.http_api import HttpApiProvider


def _uho_payload() -> dict:
    """Respuesta real (recortada) de ``auth.uho.edu.cu`` para `cmorenot`."""
    return {
        "OK": True,
        "activeUser": {
            "status": 200,
            "account_state": "TRUE",
            "uid": "cmorenot",
            "personal_information": {
                "dni": "94061342900",
                "cn": "CARLOS EMILIO MORENO TEJEDA",
                "given_name": "CARLOS EMILIO",
                "sn": "MORENO TEJEDA",
                "personal_photo": "data:image/png;base64,iVBORw0KGgo=",
                "overlapping": "",
            },
            "account_info": {
                "user_type": "Trabajador",
                "create_user": "Marilin Velázquez Marrero [mvelazquezm]",
                "create_date": "2018-09-05 09:13:43",
                "modify_user": "AGA-CLI",
                "modify_data": "2026-04-29 07:19:52 pm",
                "accept_system_policies": True,
                "password": {
                    "user_password_set": "2026-03-31 08:51:14 am",
                    "pass_valid": "Valido",
                    "pass_set": "46",
                },
            },
        },
        "message": "Inició sesión",
    }


def _uho_config() -> SimpleNamespace:
    """Configuración recomendada para `auth.uho.edu.cu`.

    Se usa ``SimpleNamespace`` para evitar tocar la BD de tests: el provider
    solo lee atributos del objeto, no llama métodos del modelo.
    """
    return SimpleNamespace(
        # conexión
        http_api_base_url='https://auth.uho.edu.cu',
        http_api_login_path='/api/login',
        http_api_method='POST',
        http_api_username_field='username',
        http_api_password_field='password',
        http_api_extra_headers={},
        http_api_verify_ssl=True,
        http_api_timeout=10,
        # mapeo
        http_api_success_field='OK',
        http_api_user_path='activeUser',
        http_api_attr_username='uid',
        http_api_attr_email='',
        http_api_attr_first_name='personal_information.given_name',
        http_api_attr_last_name='personal_information.sn',
        http_api_attr_id_card='personal_information.dni',
        http_api_attr_personal_photo='personal_information.personal_photo',
        http_api_groups_path='activeUser.account_info.user_type',
        http_api_email_template='{username}@uho.edu.cu',
    )


class HttpApiUhoTests(TestCase):
    """Tests aislados (sin BD) del parser HTTP API para la respuesta UHo."""

    def setUp(self):
        self.cfg = _uho_config()
        self.provider = HttpApiProvider(self.cfg)

    # ---------------------------------------------------------- mocking helpers

    def _mock_response(self, payload: dict, status: int = 200):
        """Fabricar un mock de ``requests.Response`` suficiente para el provider."""
        mock = SimpleNamespace(status_code=status, json=lambda: payload)
        return mock

    @contextmanager
    def _mock_request(self, payload: dict, status: int = 200):
        """Mockea ``requests.request`` aunque la lib no esté instalada.

        El módulo del provider hace ``import requests`` con try/except y, si
        falla, deja ``requests = None`` y ``REQUESTS_AVAILABLE = False``. Para
        tests del parser sin red, parchamos ambos.
        """
        fake_requests = MagicMock()
        fake_requests.request = MagicMock(return_value=self._mock_response(payload, status))
        with patch.object(http_api_module, 'requests', fake_requests), \
             patch.object(http_api_module, 'REQUESTS_AVAILABLE', True):
            yield fake_requests

    # ---------------------------------------------------------------- tests core

    def test_authenticate_parses_uho_response_with_nested_attrs(self):
        """Camino feliz: parseo de la respuesta real de UHo."""
        with self._mock_request(_uho_payload()):
            result = self.provider.authenticate('cmorenot', 'whatever')

        self.assertIsNotNone(result)
        assert result is not None  # narrowing para el type-checker
        self.assertEqual(result.username, 'cmorenot')
        self.assertEqual(result.first_name, 'CARLOS EMILIO')
        self.assertEqual(result.last_name, 'MORENO TEJEDA')
        self.assertEqual(result.id_card, '94061342900')
        self.assertEqual(result.personal_photo, 'data:image/png;base64,iVBORw0KGgo=')
        self.assertEqual(result.groups, ['Trabajador'])

    def test_authenticate_synthesizes_email_from_template(self):
        """UHo no devuelve email → la plantilla debe sintetizarlo."""
        with self._mock_request(_uho_payload()):
            result = self.provider.authenticate('cmorenot', 'whatever')

        assert result is not None
        self.assertEqual(result.email, 'cmorenot@uho.edu.cu')

    def test_authenticate_fails_when_ok_false(self):
        """Si ``OK=false`` el provider retorna ``None`` (login rechazado)."""
        bad_payload = {'OK': False, 'message': 'Credenciales inválidas'}
        with self._mock_request(bad_payload, status=200):
            result = self.provider.authenticate('cmorenot', 'wrong-password')

        self.assertIsNone(result)

    def test_no_email_template_leaves_email_blank(self):
        """Sin plantilla: el email queda vacío y no truena."""
        self.cfg.http_api_email_template = ''
        with self._mock_request(_uho_payload()):
            result = self.provider.authenticate('cmorenot', 'whatever')

        assert result is not None
        self.assertEqual(result.email, '')

    def test_test_method_returns_extracted_attrs(self):
        """``test()`` con credenciales reales devuelve `details.extracted` completo."""
        with self._mock_request(_uho_payload()):
            result = self.provider.test(test_username='cmorenot', test_password='whatever')

        self.assertTrue(result.ok)
        extracted = result.details.get('extracted', {})
        self.assertEqual(extracted.get('username'), 'cmorenot')
        self.assertEqual(extracted.get('email'), 'cmorenot@uho.edu.cu')
        self.assertEqual(extracted.get('first_name'), 'CARLOS EMILIO')
        self.assertEqual(extracted.get('last_name'), 'MORENO TEJEDA')
        self.assertEqual(extracted.get('id_card'), '94061342900')
        self.assertTrue(extracted.get('personal_photo', '').startswith('data:image/png;base64,'))
        self.assertEqual(extracted.get('groups'), ['Trabajador'])

    def test_backwards_compat_flat_lookup(self):
        """Una config sin dot-paths debe seguir funcionando como antes."""
        flat_cfg = _uho_config()
        flat_cfg.http_api_user_path = 'activeUser.personal_information'
        flat_cfg.http_api_attr_first_name = 'given_name'  # lookup plano
        flat_cfg.http_api_attr_last_name = 'sn'
        flat_cfg.http_api_attr_id_card = 'dni'
        flat_cfg.http_api_attr_personal_photo = 'personal_photo'
        # Sin grupos al cambiar el user_path: probar que no truena.
        flat_cfg.http_api_groups_path = ''
        flat_cfg.http_api_attr_username = ''  # forzar fallback al username del request

        provider = HttpApiProvider(flat_cfg)
        with self._mock_request(_uho_payload()):
            result = provider.authenticate('cmorenot', 'whatever')

        assert result is not None
        self.assertEqual(result.username, 'cmorenot')  # fallback
        self.assertEqual(result.first_name, 'CARLOS EMILIO')
        self.assertEqual(result.id_card, '94061342900')
        self.assertEqual(result.groups, [])
