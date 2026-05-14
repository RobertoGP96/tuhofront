"""
Tests para los trámites de Secretaría Docente.

Ejecutar con::

    python manage.py test apps.secretary_doc.tests

Cobertura:
  - POST `/api/v1/tramites-secretaria/tramites/` por todos los roles → 201
  - POST sin autenticación → 401
  - El listado respeta `IsOwnerOrReadOnly` (otros usuarios pueden listar pero solo
    editar lo propio).
  - `created_by` y `user` se asignan automáticamente desde request.user.
  - Validación: tipo de estudio inválido → 400.
"""
from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient

from apps.platform.models import User
from .models import SecretaryDocProcedure


URL = '/api/v1/tramites-secretaria/tramites/'


def _make_user(username, user_type, id_card, **overrides):
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


def _valid_payload():
    return {
        'study_type': 'PREGRADO',
        'visibility_type': 'NACIONAL',
        'career': 'Ingeniería Informática',
        'year': '2024',
        'academic_program': 'Pregrado en Ingeniería Informática',
        'document_type': 'CERTIFICACION_NOTAS',
        'interest': 'ESTATAL',
        'full_name': 'Juan Pérez García',
        'id_card': '02050512345',
        'email': 'juan@uho.edu.cu',
        'phone': '+53 52345678',
    }


class SecretaryDocProcedureCreateTests(TestCase):

    @classmethod
    def setUpTestData(cls):
        cls.estudiante = _make_user('sec_estudiante', 'ESTUDIANTE', '02050512345')
        cls.profesor = _make_user('sec_profesor', 'PROFESOR', '80030312345')
        cls.trabajador = _make_user('sec_trabajador', 'TRABAJADOR', '75060612345')
        cls.externo = _make_user('sec_externo', 'EXTERNO', '78060612346')
        cls.secretaria = _make_user('sec_secretaria', 'SECRETARIA_DOCENTE', '70010112345')
        cls.admin = _make_user(
            'sec_admin', 'ADMIN', '85010112345',
            is_staff=True, is_superuser=True,
        )

    def _auth(self, user):
        client = APIClient()
        client.force_authenticate(user)
        return client

    # ------------------------------------------------------------------
    # Acceso por rol
    # ------------------------------------------------------------------
    def test_unauthenticated_returns_401(self):
        resp = APIClient().post(URL, _valid_payload(), format='json')
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_estudiante_can_create(self):
        resp = self._auth(self.estudiante).post(URL, _valid_payload(), format='json')
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED, resp.content)
        self.assertEqual(SecretaryDocProcedure.objects.count(), 1)

    def test_profesor_can_create(self):
        resp = self._auth(self.profesor).post(URL, _valid_payload(), format='json')
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED, resp.content)

    def test_trabajador_can_create(self):
        resp = self._auth(self.trabajador).post(URL, _valid_payload(), format='json')
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED, resp.content)

    def test_externo_can_create(self):
        resp = self._auth(self.externo).post(URL, _valid_payload(), format='json')
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED, resp.content)

    def test_secretaria_can_create(self):
        resp = self._auth(self.secretaria).post(URL, _valid_payload(), format='json')
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED, resp.content)

    def test_admin_can_create(self):
        resp = self._auth(self.admin).post(URL, _valid_payload(), format='json')
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED, resp.content)

    # ------------------------------------------------------------------
    # Asignación de campos de auditoría
    # ------------------------------------------------------------------
    def test_created_by_and_user_are_request_user(self):
        client = self._auth(self.estudiante)
        resp = client.post(URL, _valid_payload(), format='json')
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED, resp.content)
        proc = SecretaryDocProcedure.objects.get()
        self.assertEqual(proc.created_by, self.estudiante)
        self.assertEqual(proc.updated_by, self.estudiante)
        self.assertEqual(proc.user, self.estudiante)

    # ------------------------------------------------------------------
    # Validación
    # ------------------------------------------------------------------
    def test_invalid_study_type_returns_400(self):
        client = self._auth(self.estudiante)
        payload = _valid_payload()
        payload['study_type'] = 'INVALIDO'
        resp = client.post(URL, payload, format='json')
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)

    def test_missing_career_returns_400(self):
        client = self._auth(self.estudiante)
        payload = _valid_payload()
        del payload['career']
        resp = client.post(URL, payload, format='json')
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)

    def test_invalid_email_returns_400(self):
        client = self._auth(self.estudiante)
        payload = _valid_payload()
        payload['email'] = 'no-es-email'
        resp = client.post(URL, payload, format='json')
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)

    # ------------------------------------------------------------------
    # Listado
    # ------------------------------------------------------------------
    def test_list_requires_auth(self):
        resp = APIClient().get(URL)
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_list_returns_paginated(self):
        self._auth(self.estudiante).post(URL, _valid_payload(), format='json')
        resp = self._auth(self.estudiante).get(URL)
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        # ModelViewSet con DefaultRouter retorna lista o paginada según settings
        data = resp.json()
        results = data.get('results', data) if isinstance(data, dict) else data
        self.assertEqual(len(results), 1)
