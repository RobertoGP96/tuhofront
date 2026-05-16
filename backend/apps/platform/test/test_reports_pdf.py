"""
Smoke tests para endpoints de reportes PDF.

Verifican:
  - status 200 con usuario autorizado
  - content_type application/pdf
  - bytes inician con %PDF
  - Content-Disposition es attachment
  - scoping: roles incorrectos reciben 403
"""
from django.contrib.auth import get_user_model
from django.urls import reverse as _reverse
from rest_framework import status
from rest_framework.test import APIClient, APITestCase


User = get_user_model()


def reverse(name, *args, **kwargs):
    """Wrapper que agrega el namespace 'platform:' si no está presente."""
    if ':' not in name:
        name = f'platform:{name}'
    return _reverse(name, *args, **kwargs)


def _make_user(**overrides):
    base = dict(
        username='user_pdf', email='pdf@example.com', password='pwd12345',
        first_name='Reporte', last_name='Test', user_type='USUARIO',
        id_card='99020234567', is_active=True,
    )
    base.update(overrides)
    pwd = base.pop('password')
    user = User(**base)
    user.set_password(pwd)
    user.save()
    return user


class ReportsPDFEndpointsTests(APITestCase):
    """Smoke + scoping tests."""

    @classmethod
    def setUpTestData(cls):
        cls.admin = _make_user(
            username='admin_pdf', email='admin_pdf@example.com',
            id_card='99030334567', user_type='ADMIN', is_staff=True,
        )
        cls.estudiante = _make_user(
            username='student_pdf', email='student_pdf@example.com',
            id_card='99040434567', user_type='USUARIO',
        )

    def _auth(self, user):
        client = APIClient()
        client.force_authenticate(user=user)
        return client

    # ---- happy paths ----

    def test_admin_overview_pdf_ok(self):
        url = reverse('reports-overview-pdf')
        resp = self._auth(self.admin).get(url)
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp['Content-Type'], 'application/pdf')
        self.assertIn('attachment', resp['Content-Disposition'])
        self.assertTrue(resp.content[:4] == b'%PDF', 'Response body must be a PDF')

    def test_my_history_pdf_ok(self):
        url = reverse('reports-my-history-pdf')
        resp = self._auth(self.estudiante).get(url)
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp['Content-Type'], 'application/pdf')
        self.assertTrue(resp.content[:4] == b'%PDF')

    def test_internal_domain_invalid_returns_400(self):
        # ADMIN, dominio inexistente
        resp = self._auth(self.admin).get('/api/v1/reports/internal/foobar.pdf')
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)

    # ---- scoping / permisos ----

    def test_estudiante_cannot_access_admin_overview(self):
        url = reverse('reports-overview-pdf')
        resp = self._auth(self.estudiante).get(url)
        self.assertIn(resp.status_code, (status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN))

    def test_anonymous_blocked_on_my_history(self):
        url = reverse('reports-my-history-pdf')
        resp = APIClient().get(url)
        self.assertIn(resp.status_code, (status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN))

    def test_filters_accepted(self):
        """date_from / date_to / state no rompen la generación."""
        url = reverse('reports-my-history-pdf')
        resp = self._auth(self.estudiante).get(url, {
            'date_from': '2024-01-01',
            'date_to': '2099-12-31',
            'state': 'APROBADO',
        })
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp['Content-Type'], 'application/pdf')


class ReportsCrossModuleScopingTests(APITestCase):
    """Garantiza que un gestor de un módulo NO pueda generar reportes de otro módulo.

    Cada gestor solo accede a los reportes de su propio módulo + (en ningún caso)
    al overview global, que es exclusivo de ADMIN. Los USUARIO solo pueden generar
    su historial personal (`me.pdf`).
    """

    @classmethod
    def setUpTestData(cls):
        cls.gestor_interno = _make_user(
            username='gi_pdf', email='gi_pdf@example.com',
            id_card='99050534567', user_type='GESTOR_INTERNO',
        )
        cls.gestor_secretaria = _make_user(
            username='gs_pdf', email='gs_pdf@example.com',
            id_card='99060634567', user_type='GESTOR_SECRETARIA',
        )
        cls.gestor_reservas = _make_user(
            username='gr_pdf', email='gr_pdf@example.com',
            id_card='99070734567', user_type='GESTOR_RESERVAS',
        )
        cls.usuario = _make_user(
            username='us_pdf', email='us_pdf@example.com',
            id_card='99080834567', user_type='USUARIO',
        )

    def _auth(self, user):
        client = APIClient()
        client.force_authenticate(user=user)
        return client

    def _assert_forbidden(self, user, url):
        resp = self._auth(user).get(url)
        self.assertEqual(
            resp.status_code, status.HTTP_403_FORBIDDEN,
            msg=f'Se esperaba 403 para {user.user_type} en {url}, se recibió {resp.status_code}',
        )

    def _assert_ok(self, user, url):
        resp = self._auth(user).get(url)
        self.assertEqual(
            resp.status_code, status.HTTP_200_OK,
            msg=f'Se esperaba 200 para {user.user_type} en {url}, se recibió {resp.status_code}',
        )

    # ---- GESTOR_INTERNO solo accede a internal/<domain>.pdf ----

    def test_gestor_interno_can_access_internal_domain(self):
        self._assert_ok(self.gestor_interno, '/api/v1/reports/internal/feeding.pdf')

    def test_gestor_interno_blocked_from_other_modules(self):
        forbidden = [
            reverse('reports-overview-pdf'),
            reverse('reports-tramites-pdf'),
            reverse('reports-reservations-pdf'),
            reverse('reports-secretary-pdf'),
            reverse('reports-my-history-pdf'),
        ]
        for url in forbidden:
            self._assert_forbidden(self.gestor_interno, url)

    # ---- GESTOR_SECRETARIA solo accede a procedures.pdf y secretary.pdf ----

    def test_gestor_secretaria_can_access_own_module(self):
        self._assert_ok(self.gestor_secretaria, reverse('reports-tramites-pdf'))
        self._assert_ok(self.gestor_secretaria, reverse('reports-secretary-pdf'))

    def test_gestor_secretaria_blocked_from_other_modules(self):
        forbidden = [
            reverse('reports-overview-pdf'),
            '/api/v1/reports/internal/feeding.pdf',
            '/api/v1/reports/internal/accommodation.pdf',
            reverse('reports-reservations-pdf'),
            reverse('reports-my-history-pdf'),
        ]
        for url in forbidden:
            self._assert_forbidden(self.gestor_secretaria, url)

    # ---- GESTOR_RESERVAS solo accede a reservations.pdf ----

    def test_gestor_reservas_can_access_own_module(self):
        self._assert_ok(self.gestor_reservas, reverse('reports-reservations-pdf'))

    def test_gestor_reservas_blocked_from_other_modules(self):
        forbidden = [
            reverse('reports-overview-pdf'),
            '/api/v1/reports/internal/transport.pdf',
            reverse('reports-tramites-pdf'),
            reverse('reports-secretary-pdf'),
            reverse('reports-my-history-pdf'),
        ]
        for url in forbidden:
            self._assert_forbidden(self.gestor_reservas, url)

    # ---- USUARIO solo accede a me.pdf ----

    def test_usuario_can_access_own_history(self):
        self._assert_ok(self.usuario, reverse('reports-my-history-pdf'))

    def test_usuario_blocked_from_module_reports(self):
        forbidden = [
            reverse('reports-overview-pdf'),
            '/api/v1/reports/internal/feeding.pdf',
            reverse('reports-tramites-pdf'),
            reverse('reports-reservations-pdf'),
            reverse('reports-secretary-pdf'),
        ]
        for url in forbidden:
            self._assert_forbidden(self.usuario, url)
