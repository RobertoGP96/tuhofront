"""
Tests de smoke — cubren los flujos críticos que no pueden romperse en despliegue.

Estos no son tests exhaustivos: validan que los endpoints clave responden con
el código y la forma esperados. Se ejecutan con::

    python manage.py test apps.platform.test.test_smoke

Cubre:
- ``/api/v1/health/`` retorna 200.
- Login con credenciales válidas → 200 con ``access`` + ``user.is_staff``.
- Login con credenciales inválidas → 401.
- ``GET /procedures/`` sin token → 401.
- ``GET /procedures/`` con admin → 200 paginado.
- ``POST /internal/feeding-days/`` con usuario normal → 403 (RBAC reforzado).
- ``GET /procedures/stats/`` retorna el diccionario agregado con conteos.
- Activación con token expirado → 400.
"""
from datetime import timedelta

from django.test import TestCase
from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APIClient

from apps.platform.models import User


class HealthSmokeTest(TestCase):
    def test_health_endpoint_returns_ok(self):
        client = APIClient()
        resp = client.get('/api/v1/health/')
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(data['status'], 'ok')
        self.assertEqual(data['database'], 'ok')


class AuthSmokeTest(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.admin = User(
            username='smoke_admin',
            email='smoke_admin@uho.edu.cu',
            first_name='Smoke',
            last_name='Admin',
            user_type='ADMIN',
            id_card='85010112345',
            is_active=True,
            email_verified=True,
            is_staff=True,
            is_superuser=True,
        )
        cls.admin.set_password('Admin12345')
        cls.admin.save()

        cls.student = User(
            username='smoke_student',
            email='smoke_student@uho.edu.cu',
            first_name='Smoke',
            last_name='Student',
            user_type='ESTUDIANTE',
            id_card='02050512345',
            is_active=True,
            email_verified=True,
        )
        cls.student.set_password('Demo12345')
        cls.student.save()

    def test_login_with_valid_credentials(self):
        client = APIClient()
        resp = client.post(
            '/api/v1/auth/login/',
            {'username': 'smoke_admin', 'password': 'Admin12345'},
            format='json',
        )
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        data = resp.json()
        self.assertIn('access', data)
        self.assertIn('refresh', data)
        self.assertEqual(data['user']['username'], 'smoke_admin')
        self.assertTrue(data['user']['is_staff'])

    def test_login_with_invalid_credentials(self):
        client = APIClient()
        resp = client.post(
            '/api/v1/auth/login/',
            {'username': 'smoke_admin', 'password': 'wrong'},
            format='json',
        )
        # SimpleJWT devuelve 401 con credenciales inválidas
        self.assertIn(resp.status_code, (401, 400))

    def test_procedures_list_requires_auth(self):
        client = APIClient()
        resp = client.get('/api/v1/procedures/')
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_procedures_list_with_admin_returns_paginated(self):
        client = APIClient()
        client.force_authenticate(self.admin)
        resp = client.get('/api/v1/procedures/')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        data = resp.json()
        self.assertIn('results', data)
        self.assertIn('count', data)

    def test_procedures_stats_returns_aggregated_dict(self):
        client = APIClient()
        client.force_authenticate(self.admin)
        resp = client.get('/api/v1/procedures/stats/')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        data = resp.json()
        for key in ('total', 'borrador', 'enviado', 'en_proceso', 'aprobado',
                    'rechazado', 'finalizado', 'requiere_info'):
            self.assertIn(key, data)

    def test_internal_feeding_days_post_requires_staff(self):
        """Un estudiante no puede crear catálogos de FeedingDays (RBAC)."""
        client = APIClient()
        client.force_authenticate(self.student)
        resp = client.post(
            '/api/v1/internal/feeding-days/',
            {
                'date': '2026-12-31',
                'breakfast': 10,
                'lunch': 10,
                'dinner': 10,
                'snack': 0,
            },
            format='json',
        )
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)

    def test_internal_feeding_days_get_allowed_for_students(self):
        """Lectura sí permitida (IsStaffOrReadOnly)."""
        client = APIClient()
        client.force_authenticate(self.student)
        resp = client.get('/api/v1/internal/feeding-days/')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)


class ActivationTokenExpirationTest(TestCase):
    """Verifica que un token de activación expirado sea rechazado."""

    @classmethod
    def setUpTestData(cls):
        cls.user = User(
            username='to_activate',
            email='activate@uho.edu.cu',
            first_name='To',
            last_name='Activate',
            user_type='ESTUDIANTE',
            id_card='02050512346',
            is_active=False,
            email_verified=False,
        )
        cls.user.set_password('TempPass12345')
        cls.user.save()

    def test_expired_activation_token_is_rejected(self):
        self.user.generate_activation_token(lifetime_hours=24)
        # Forzar expiración en el pasado
        self.user.activation_token_expires_at = timezone.now() - timedelta(minutes=1)
        self.user.save(update_fields=['activation_token_expires_at'])

        client = APIClient()
        resp = client.post(
            '/api/v1/users/activate/',
            {'activation_token': self.user.activation_token},
            format='json',
        )
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', resp.json())
        # El usuario debe seguir inactivo
        self.user.refresh_from_db()
        self.assertFalse(self.user.is_active)

    def test_valid_activation_token_activates_user(self):
        self.user.generate_activation_token(lifetime_hours=24)
        client = APIClient()
        resp = client.post(
            '/api/v1/users/activate/',
            {'activation_token': self.user.activation_token},
            format='json',
        )
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertTrue(self.user.is_active)
        self.assertTrue(self.user.email_verified)
        self.assertIsNone(self.user.activation_token)


class PublicContactSmokeTest(TestCase):
    """Verifica el endpoint POST /api/v1/public/contact/."""

    def setUp(self):
        # Forzar console backend para evitar SMTP real en tests
        from django.test.utils import override_settings
        self._override = override_settings(
            EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend',
        )
        self._override.enable()

    def tearDown(self):
        self._override.disable()

    def test_contact_valid_returns_202(self):
        client = APIClient()
        resp = client.post(
            '/api/v1/public/contact/',
            {
                'username': 'Juan',
                'lastname': 'Perez',
                'id_card': '85010112345',
                'email': 'juan@uho.edu.cu',
                'phone': '52345678',
                'subject': 'Consulta general',
                'message': 'Necesito información sobre los trámites docentes.',
            },
            format='json',
        )
        self.assertEqual(resp.status_code, status.HTTP_202_ACCEPTED)
        self.assertIn('detail', resp.json())

    def test_contact_invalid_returns_400(self):
        client = APIClient()
        resp = client.post(
            '/api/v1/public/contact/',
            {'username': 'X', 'lastname': 'Y', 'message': ''},
            format='json',
        )
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)
        errors = resp.json()
        # Falta email + id_card y message vacío
        self.assertIn('email', errors)
        self.assertIn('id_card', errors)

    def test_contact_does_not_require_auth(self):
        client = APIClient()
        # Cliente sin auth: no debe ser 401
        resp = client.post(
            '/api/v1/public/contact/',
            {
                'username': 'Anonimo',
                'lastname': 'Externo',
                'id_card': '78060612345',
                'email': 'externo@example.com',
                'message': 'Soy un externo sin cuenta.',
            },
            format='json',
        )
        self.assertNotEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(resp.status_code, status.HTTP_202_ACCEPTED)
