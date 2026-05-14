"""
Tests para los trámites internos: Alimentación, Hospedaje, Transporte y Mantenimiento.

Ejecutar con::

    python manage.py test apps.internal.tests

Cobertura:
  - Creación de cada tipo de trámite por usuarios de todos los roles
    (ESTUDIANTE, PROFESOR, TRABAJADOR, EXTERNO, GESTOR_INTERNO, ADMIN).
  - POST sin autenticación retorna 401.
  - El listado filtra por dueño para usuarios normales y muestra todo para staff.
  - `user` se asigna automáticamente desde `request.user` (no se acepta override).
"""
from datetime import date, timedelta

from django.test import TestCase
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APIClient

from apps.platform.models import User
from .models import (
    FeedingProcedure,
    AccommodationProcedure,
    TransportProcedure,
    TransportProcedureType,
    MaintanceProcedure,
    MaintanceProcedureType,
    MaintancePriority,
)


def _make_user(username, user_type, id_card, **overrides):
    """Helper: crea un usuario activo con contraseña conocida."""
    base = dict(
        username=username,
        email=f'{username}@uho.edu.cu',
        first_name=username.capitalize(),
        last_name='Test',
        user_type=user_type,
        id_card=id_card,
        is_active=True,
        email_verified=True,
    )
    base.update(overrides)
    user = User(**base)
    user.set_password('Demo12345')
    user.save()
    return user


class InternalProceduresTestMixin:
    """Crea usuarios y catálogos compartidos para los 4 sets de tests."""

    @classmethod
    def setUpTestData(cls):
        cls.estudiante = _make_user('test_estudiante', 'ESTUDIANTE', '02050512345')
        cls.profesor = _make_user('test_profesor', 'PROFESOR', '80030312345')
        cls.trabajador = _make_user('test_trabajador', 'TRABAJADOR', '75060612345')
        cls.externo = _make_user('test_externo', 'EXTERNO', '78060612346')
        cls.gestor_interno = _make_user('test_gestor_int', 'GESTOR_INTERNO', '70010112345')
        cls.admin = _make_user(
            'test_admin', 'ADMIN', '85010112345',
            is_staff=True, is_superuser=True,
        )

        # Catálogos requeridos por Transport y Maintenance
        cls.transport_type = TransportProcedureType.objects.create(name='Microbus')
        cls.maintance_type = MaintanceProcedureType.objects.create(name='Eléctrico')
        cls.maintance_priority = MaintancePriority.objects.create(name='Alta')

    def _auth(self, user):
        client = APIClient()
        client.force_authenticate(user)
        return client


# ---------------------------------------------------------------------------
# Feeding
# ---------------------------------------------------------------------------
class FeedingProcedureCreateTests(InternalProceduresTestMixin, TestCase):
    """Trámite de alimentación."""

    URL = '/api/v1/internal/feeding-procedures/'

    def _payload(self):
        start = (date.today() + timedelta(days=1)).isoformat()
        end = (date.today() + timedelta(days=3)).isoformat()
        return {
            'feeding_type': 'RESTAURANT',
            'start_day': start,
            'end_day': end,
            'description': 'Almuerzo durante evento',
            'amount': 5,
            'feeding_days': [
                {'date': start, 'breakfast': 0, 'lunch': 5, 'dinner': 0, 'snack': 0},
            ],
        }

    def test_unauthenticated_returns_401(self):
        client = APIClient()
        resp = client.post(self.URL, self._payload(), format='json')
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_estudiante_can_create(self):
        client = self._auth(self.estudiante)
        resp = client.post(self.URL, self._payload(), format='json')
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED, resp.content)
        self.assertEqual(FeedingProcedure.objects.filter(user=self.estudiante).count(), 1)

    def test_profesor_can_create(self):
        client = self._auth(self.profesor)
        resp = client.post(self.URL, self._payload(), format='json')
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED, resp.content)

    def test_externo_can_create(self):
        client = self._auth(self.externo)
        resp = client.post(self.URL, self._payload(), format='json')
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED, resp.content)

    def test_gestor_interno_can_create(self):
        client = self._auth(self.gestor_interno)
        resp = client.post(self.URL, self._payload(), format='json')
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED, resp.content)

    def test_admin_can_create(self):
        client = self._auth(self.admin)
        resp = client.post(self.URL, self._payload(), format='json')
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED, resp.content)

    def test_user_field_is_assigned_from_request(self):
        """Aunque el payload intente forzar user, debe asignarse el del request."""
        client = self._auth(self.estudiante)
        payload = self._payload()
        payload['user'] = self.admin.pk  # intento malicioso
        resp = client.post(self.URL, payload, format='json')
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED, resp.content)
        proc = FeedingProcedure.objects.get()
        self.assertEqual(proc.user, self.estudiante)

    def test_normal_user_only_sees_own_in_list(self):
        # Estudiante crea uno
        self._auth(self.estudiante).post(self.URL, self._payload(), format='json')
        # Profesor crea otro
        self._auth(self.profesor).post(self.URL, self._payload(), format='json')

        # Estudiante solo ve el suyo
        resp = self._auth(self.estudiante).get(self.URL)
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        results = resp.json().get('results', resp.json())
        self.assertEqual(len(results), 1)

    def test_admin_sees_all_in_list(self):
        self._auth(self.estudiante).post(self.URL, self._payload(), format='json')
        self._auth(self.profesor).post(self.URL, self._payload(), format='json')

        resp = self._auth(self.admin).get(self.URL)
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        results = resp.json().get('results', resp.json())
        self.assertEqual(len(results), 2)


# ---------------------------------------------------------------------------
# Accommodation
# ---------------------------------------------------------------------------
class AccommodationProcedureCreateTests(InternalProceduresTestMixin, TestCase):
    """Trámite de hospedaje."""

    URL = '/api/v1/internal/accommodation-procedures/'

    def _payload(self):
        start = (date.today() + timedelta(days=1)).isoformat()
        end = (date.today() + timedelta(days=3)).isoformat()
        return {
            'accommodation_type': 'HOTEL',
            'start_day': start,
            'end_day': end,
            'description': 'Hospedaje para visita académica',
            'guests': [
                {'name': 'Juan Pérez', 'sex': 'M', 'identification': '02050599999'},
            ],
            'feeding_days': [],
        }

    def test_unauthenticated_returns_401(self):
        resp = APIClient().post(self.URL, self._payload(), format='json')
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_estudiante_can_create(self):
        resp = self._auth(self.estudiante).post(self.URL, self._payload(), format='json')
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED, resp.content)
        self.assertEqual(AccommodationProcedure.objects.filter(user=self.estudiante).count(), 1)

    def test_profesor_can_create(self):
        resp = self._auth(self.profesor).post(self.URL, self._payload(), format='json')
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED, resp.content)

    def test_externo_can_create(self):
        resp = self._auth(self.externo).post(self.URL, self._payload(), format='json')
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED, resp.content)

    def test_admin_can_create(self):
        resp = self._auth(self.admin).post(self.URL, self._payload(), format='json')
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED, resp.content)

    def test_user_field_is_assigned_from_request(self):
        client = self._auth(self.estudiante)
        payload = self._payload()
        payload['user'] = self.admin.pk
        resp = client.post(self.URL, payload, format='json')
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED, resp.content)
        proc = AccommodationProcedure.objects.get()
        self.assertEqual(proc.user, self.estudiante)


# ---------------------------------------------------------------------------
# Transport
# ---------------------------------------------------------------------------
class TransportProcedureCreateTests(InternalProceduresTestMixin, TestCase):
    """Trámite de transporte."""

    URL = '/api/v1/internal/transport-procedures/'

    def _payload(self):
        departure = (timezone.now() + timedelta(days=1)).isoformat()
        return_t = (timezone.now() + timedelta(days=1, hours=4)).isoformat()
        return {
            'procedure_type': self.transport_type.pk,
            'departure_time': departure,
            'return_time': return_t,
            'departure_place': 'Holguín',
            'return_place': 'Holguín',
            'passengers': 3,
            'description': 'Traslado a evento',
            'round_trip': True,
        }

    def test_unauthenticated_returns_401(self):
        resp = APIClient().post(self.URL, self._payload(), format='json')
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_estudiante_can_create(self):
        resp = self._auth(self.estudiante).post(self.URL, self._payload(), format='json')
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED, resp.content)
        self.assertEqual(TransportProcedure.objects.filter(user=self.estudiante).count(), 1)

    def test_profesor_can_create(self):
        resp = self._auth(self.profesor).post(self.URL, self._payload(), format='json')
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED, resp.content)

    def test_externo_can_create(self):
        resp = self._auth(self.externo).post(self.URL, self._payload(), format='json')
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED, resp.content)

    def test_admin_can_create(self):
        resp = self._auth(self.admin).post(self.URL, self._payload(), format='json')
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED, resp.content)

    def test_invalid_procedure_type_returns_400(self):
        client = self._auth(self.estudiante)
        payload = self._payload()
        payload['procedure_type'] = 999999  # No existe
        resp = client.post(self.URL, payload, format='json')
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)


# ---------------------------------------------------------------------------
# Maintenance
# ---------------------------------------------------------------------------
class MaintanceProcedureCreateTests(InternalProceduresTestMixin, TestCase):
    """Trámite de mantenimiento."""

    URL = '/api/v1/internal/maintance-procedures/'

    def _payload(self):
        return {
            'procedure_type': self.maintance_type.pk,
            'priority': self.maintance_priority.pk,
            'description': 'Cambio de bombillo en aula 101',
        }

    def test_unauthenticated_returns_401(self):
        resp = APIClient().post(self.URL, self._payload(), format='json')
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_estudiante_can_create(self):
        resp = self._auth(self.estudiante).post(self.URL, self._payload(), format='json')
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED, resp.content)
        self.assertEqual(MaintanceProcedure.objects.filter(user=self.estudiante).count(), 1)

    def test_profesor_can_create(self):
        resp = self._auth(self.profesor).post(self.URL, self._payload(), format='json')
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED, resp.content)

    def test_externo_can_create(self):
        resp = self._auth(self.externo).post(self.URL, self._payload(), format='json')
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED, resp.content)

    def test_admin_can_create(self):
        resp = self._auth(self.admin).post(self.URL, self._payload(), format='json')
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED, resp.content)

    def test_invalid_priority_returns_400(self):
        client = self._auth(self.estudiante)
        payload = self._payload()
        payload['priority'] = 999999
        resp = client.post(self.URL, payload, format='json')
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)

    def test_missing_procedure_type_returns_400(self):
        client = self._auth(self.estudiante)
        payload = self._payload()
        del payload['procedure_type']
        resp = client.post(self.URL, payload, format='json')
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)
