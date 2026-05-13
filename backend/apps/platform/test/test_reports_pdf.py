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
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient, APITestCase


User = get_user_model()


def _make_user(**overrides):
    base = dict(
        username='user_pdf', email='pdf@example.com', password='pwd12345',
        first_name='Reporte', last_name='Test', user_type='ESTUDIANTE',
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
            id_card='99040434567', user_type='ESTUDIANTE',
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
