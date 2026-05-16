"""
Tests de smoke para el módulo de reservas de locales (labs).

Ejecutar con::

    python manage.py test apps.labs.tests
"""
from datetime import timedelta

from django.test import TestCase
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APIClient

from apps.platform.models import User
from .models import Local, LocalReservation
from .enums import LocalTypeEnum, ReservationStateEnum, ReservationPurposeEnum


class LabsSmokeTest(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.admin = User(
            username='labs_admin',
            email='labs_admin@uho.edu.cu',
            first_name='Labs',
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

        cls.profesor = User(
            username='labs_prof',
            email='labs_prof@uho.edu.cu',
            first_name='Carlos',
            last_name='Profesor',
            user_type='USUARIO',
            id_card='80030312345',
            is_active=True,
            email_verified=True,
        )
        cls.profesor.set_password('Demo12345')
        cls.profesor.save()

        cls.local = Local.objects.create(
            name='Test Aula 101',
            code='TEST-AULA-101',
            local_type=LocalTypeEnum.AULA,
            capacity=30,
            is_active=True,
            requires_approval=True,
        )

    def test_list_locals_requires_auth(self):
        client = APIClient()
        resp = client.get('/api/v1/labs/locals/')
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_list_locals_returns_seeded(self):
        client = APIClient()
        client.force_authenticate(self.admin)
        resp = client.get('/api/v1/labs/locals/')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        data = resp.json()
        self.assertIn('results', data)
        codes = [r['code'] for r in data['results']]
        self.assertIn('TEST-AULA-101', codes)

    def test_profesor_can_create_reservation(self):
        client = APIClient()
        client.force_authenticate(self.profesor)
        now = timezone.now()
        start = (now + timedelta(days=2)).replace(hour=9, minute=0, second=0, microsecond=0)
        resp = client.post(
            '/api/v1/labs/reservations/',
            {
                'local': str(self.local.id),
                'start_time': start.isoformat(),
                'end_time': (start + timedelta(hours=2)).isoformat(),
                'purpose': ReservationPurposeEnum.CLASE,
                'purpose_detail': 'Clase de prueba',
                'expected_attendees': 20,
                'responsible_name': 'Carlos Profesor',
                'responsible_phone': '52345680',
                'responsible_email': 'labs_prof@uho.edu.cu',
            },
            format='json',
        )
        self.assertIn(resp.status_code, (status.HTTP_201_CREATED, status.HTTP_200_OK))

    def test_only_admin_can_create_local(self):
        client = APIClient()
        client.force_authenticate(self.profesor)
        resp = client.post(
            '/api/v1/labs/locals/',
            {
                'name': 'Hack Lab',
                'code': 'HACK-001',
                'local_type': LocalTypeEnum.LABORATORIO,
                'capacity': 10,
            },
            format='json',
        )
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)

    def test_reservation_list_returns_paginated(self):
        client = APIClient()
        client.force_authenticate(self.profesor)
        resp = client.get('/api/v1/labs/reservations/')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        data = resp.json()
        self.assertIn('results', data)
        self.assertIn('count', data)
