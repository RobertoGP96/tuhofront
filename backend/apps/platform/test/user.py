from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from datetime import date, timedelta

Usuario = get_user_model()


class UsuarioModelTest(TestCase):
    """Tests para el modelo Usuario"""
    
    def setUp(self):
        """Configuración inicial para los tests"""
        self.user_data = {
            'username': 'testuser',
            'email': 'test@example.com',
            'first_name': 'Test',
            'last_name': 'User',
            'id_card': '99010112345',
            'password': 'testpass123',
            'user_type': 'ESTUDIANTE'
        }
    
    def test_create_user(self):
        """Test de creación de usuario"""
        user = Usuario.objects.create_user(**self.user_data)
        
        self.assertEqual(user.username, 'testuser')
        self.assertEqual(user.email, 'test@example.com')
        self.assertTrue(user.check_password('testpass123'))
        self.assertEqual(user.user_type, 'ESTUDIANTE')
    
    def test_email_normalization(self):
        """Test de normalización de email"""
        user_data = self.user_data.copy()
        user_data['email'] = 'TEST@EXAMPLE.COM'
        user = Usuario.objects.create_user(**user_data)
        
        self.assertEqual(user.email, 'test@example.com')
    
    def test_carnet_unique(self):
        """Test de unicidad del carnet"""
        Usuario.objects.create_user(**self.user_data)
        
        user_data_2 = self.user_data.copy()
        user_data_2['username'] = 'testuser2'
        user_data_2['email'] = 'test2@example.com'
        
        with self.assertRaises(Exception):
            Usuario.objects.create_user(**user_data_2)
    
    def test_get_full_name(self):
        """Test del método get_full_name"""
        user = Usuario.objects.create_user(**self.user_data)
        self.assertEqual(user.get_full_name(), 'Test User')
    
    def test_age_calculation(self):
        """Test del cálculo de edad"""
        user_data = self.user_data.copy()
        user_data['date_of_birth'] = date.today() - timedelta(days=25*365)
        user = Usuario.objects.create_user(**user_data)
        
        self.assertEqual(user.age, 25)
    
    def test_generate_activation_token(self):
        """Test de generación de token de activación"""
        user = Usuario.objects.create_user(**self.user_data)
        token = user.generate_activation_token()
        
        self.assertIsNotNone(token)
        self.assertIsNotNone(user.activation_token)
    
    def test_activate_account(self):
        """Test de activación de cuenta"""
        user = Usuario.objects.create_user(**self.user_data)
        user.is_active = False
        user.save()
        
        user.activate_account()
        
        self.assertTrue(user.is_active)
        self.assertTrue(user.email_verified)
        self.assertIsNone(user.activation_token)


class UsuarioAPITest(APITestCase):
    """Tests para la API de usuarios"""
    
    def setUp(self):
        """Configuración inicial"""
        self.client = APIClient()
        
        # Crear usuario de prueba
        self.user = Usuario.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123',
            first_name='Test',
            last_name='User',
            id_card='99010112345',
            user_type='ESTUDIANTE'
        )
        
        # Crear usuario staff
        self.staff_user = Usuario.objects.create_user(
            username='staffuser',
            email='staff@example.com',
            password='staffpass123',
            first_name='Staff',
            last_name='User',
            id_card='98010112345',
            user_type='TRABAJADOR',
            is_staff=True
        )
    
    def test_create_user(self):
        """Test de creación de usuario vía API"""
        data = {
            'username': 'newuser',
            'email': 'new@example.com',
            'password': 'NewPass123!',
            'password_confirm': 'NewPass123!',
            'first_name': 'New',
            'last_name': 'User',
            'id_card': '00010112345',
            'user_type': 'ESTUDIANTE'
        }
        
        response = self.client.post('/api/usuarios/', data)
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(Usuario.objects.filter(username='newuser').exists())
    
    def test_list_users_requires_authentication(self):
        """Test que listar usuarios requiere autenticación"""
        response = self.client.get('/api/usuarios/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    def test_get_user_detail(self):
        """Test de obtener detalle de usuario"""
        self.client.force_authenticate(user=self.user)
        response = self.client.get(f'/api/usuarios/{self.user.id}/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['username'], 'testuser')
    
    def test_update_user_profile(self):
        """Test de actualización de perfil"""
        self.client.force_authenticate(user=self.user)
        
        data = {
            'first_name': 'Updated',
            'last_name': 'Name',
            'phone': '52345678'
        }
        
        response = self.client.patch(f'/api/usuarios/{self.user.id}/', data)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertEqual(self.user.first_name, 'Updated')
    
    def test_change_password(self):
        """Test de cambio de contraseña"""
        self.client.force_authenticate(user=self.user)
        
        data = {
            'old_password': 'testpass123',
            'new_password': 'NewPass123!',
            'new_password_confirm': 'NewPass123!'
        }
        
        response = self.client.post(
            f'/api/usuarios/{self.user.id}/change_password/',
            data
        )
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password('NewPass123!'))
    
    def test_get_current_user(self):
        """Test de obtener usuario actual"""
        self.client.force_authenticate(user=self.user)
        response = self.client.get('/api/usuarios/me/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['username'], 'testuser')
    
    def test_activate_account(self):
        """Test de activación de cuenta"""
        self.user.is_active = False
        token = self.user.generate_activation_token()
        
        response = self.client.post('/api/usuarios/activate/', {
            'activation_token': token
        })
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertTrue(self.user.is_active)


class UsuarioStaffAPITest(APITestCase):
    """Tests para endpoints de staff"""
    
    def setUp(self):
        """Configuración inicial"""
        self.client = APIClient()
        
        # Crear usuario staff
        self.staff_user = Usuario.objects.create_user(
            username='staffuser',
            email='staff@example.com',
            password='staffpass123',
            first_name='Staff',
            last_name='User',
            id_card='98010112345',
            user_type='TRABAJADOR',
            is_staff=True
        )
        
        # Crear usuarios de prueba
        self.test_users = []
        for i in range(5):
            user = Usuario.objects.create_user(
                username=f'user{i}',
                email=f'user{i}@example.com',
                password='testpass123',
                first_name=f'User{i}',
                last_name='Test',
                id_card=f'9901011234{i}',
                user_type='ESTUDIANTE'
            )
            self.test_users.append(user)
    
    def test_staff_can_list_all_users(self):
        """Test que staff puede listar todos los usuarios"""
        self.client.force_authenticate(user=self.staff_user)
        response = self.client.get('/api/admin/usuarios/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data['results']), 5)
    
    def test_staff_statistics(self):
        """Test de estadísticas para staff"""
        self.client.force_authenticate(user=self.staff_user)
        response = self.client.get('/api/admin/usuarios/statistics/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('total_users', response.data)
        self.assertIn('active_users', response.data)
    
    def test_bulk_activate_users(self):
        """Test de activación en lote"""
        self.client.force_authenticate(user=self.staff_user)
        
        # Desactivar usuarios
        for user in self.test_users[:3]:
            user.is_active = False
            user.save()
        
        user_ids = [user.id for user in self.test_users[:3]]
        
        response = self.client.post('/api/admin/usuarios/bulk_actions/', {
            'user_ids': user_ids,
            'action': 'activate'
        })
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Verificar que se activaron
        for user_id in user_ids:
            user = Usuario.objects.get(id=user_id)
            self.assertTrue(user.is_active)
    
    def test_non_staff_cannot_access_admin(self):
        """Test que usuarios no-staff no pueden acceder a endpoints de admin"""
        regular_user = self.test_users[0]
        self.client.force_authenticate(user=regular_user)
        
        response = self.client.get('/api/admin/usuarios/')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)


class PasswordResetTest(APITestCase):
    """Tests para reseteo de contraseña"""
    
    def setUp(self):
        """Configuración inicial"""
        self.client = APIClient()
        
        self.user = Usuario.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123',
            first_name='Test',
            last_name='User',
            id_card='99010112345'
        )
    
    def test_request_password_reset(self):
        """Test de solicitud de reseteo de contraseña"""
        response = self.client.post('/api/auth/password-reset/', {
            'email': 'test@example.com'
        })
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertIsNotNone(self.user.activation_token)
    
    def test_password_reset_confirm(self):
        """Test de confirmación de reseteo de contraseña"""
        token = self.user.generate_activation_token()
        
        response = self.client.post('/api/auth/password-reset/confirm/', {
            'token': token,
            'new_password': 'NewPass123!',
            'new_password_confirm': 'NewPass123!'
        })
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password('NewPass123!'))