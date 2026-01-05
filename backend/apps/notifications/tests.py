from django.test import TestCase
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta
from .models import Notificacion

User = get_user_model()


class NotificacionModelTests(TestCase):
    """Tests para el modelo Notificación"""
    
    def setUp(self):
        """Configura datos de prueba"""
        self.usuario_destinatario = User.objects.create_user(
            username='usuario1',
            email='usuario1@test.com',
            password='testpass123'
        )
        self.usuario_remitente = User.objects.create_user(
            username='usuario2',
            email='usuario2@test.com',
            password='testpass123'
        )
    
    def test_crear_notificacion_simple(self):
        """Verifica que se puede crear una notificación simple"""
        notificacion = Notificacion.objects.create(
            tipo='INFO',
            asunto='Test Notification',
            cuerpo='This is a test notification content',
            para=self.usuario_destinatario,
            de=self.usuario_remitente,
            prioridad='MEDIUM'
        )
        
        self.assertEqual(notificacion.asunto, 'Test Notification')
        self.assertFalse(notificacion.visto)
        self.assertEqual(notificacion.para, self.usuario_destinatario)
    
    def test_manager_unread(self):
        """Verifica el manager para notificaciones sin leer"""
        # Crear notificaciones
        notificacion_1 = Notificacion.objects.create(
            tipo='INFO',
            asunto='Not Read 1',
            cuerpo='Content 1' * 3,
            para=self.usuario_destinatario,
            visto=False
        )
        notificacion_2 = Notificacion.objects.create(
            tipo='INFO',
            asunto='Read Notification',
            cuerpo='Content 2' * 3,
            para=self.usuario_destinatario,
            visto=True
        )
        
        unread = Notificacion.objects.unread()
        self.assertEqual(unread.count(), 1)
        self.assertEqual(unread.first(), notificacion_1)
    
    def test_marcar_como_leido(self):
        """Verifica que se puede marcar una notificación como leída"""
        notificacion = Notificacion.objects.create(
            tipo='INFO',
            asunto='Test Mark Read',
            cuerpo='Content to mark as read' * 2,
            para=self.usuario_destinatario,
            visto=False
        )
        
        notificacion.marcar_como_leido(usuario=self.usuario_destinatario)
        
        notificacion.refresh_from_db()
        self.assertTrue(notificacion.visto)
        self.assertIsNotNone(notificacion.fecha_visto)
    
    def test_manager_by_type(self):
        """Verifica el filtrado por tipo de notificación"""
        notificacion_info = Notificacion.objects.create(
            tipo='INFO',
            asunto='Info Type',
            cuerpo='Content info' * 3,
            para=self.usuario_destinatario
        )
        notificacion_error = Notificacion.objects.create(
            tipo='ERROR',
            asunto='Error Type',
            cuerpo='Content error' * 3,
            para=self.usuario_destinatario
        )
        
        info_notifications = Notificacion.objects.by_type('INFO')
        self.assertEqual(info_notifications.count(), 1)
        self.assertEqual(info_notifications.first(), notificacion_info)
    
    def test_notificacion_urgente(self):
        """Verifica la detección de notificaciones urgentes"""
        notificacion_urgente = Notificacion.objects.create(
            tipo='URGENT',
            asunto='Urgent Notification',
            cuerpo='This is urgent content' * 2,
            para=self.usuario_destinatario
        )
        
        self.assertTrue(notificacion_urgente.is_urgent)
    
    def test_crear_notificacion_metodo_clase(self):
        """Verifica el método de clase crear_notificacion"""
        notificacion = Notificacion.crear_notificacion(
            tipo='SUCCESS',
            asunto='Class Method Test',
            cuerpo='Created using class method' * 2,
            para=self.usuario_destinatario,
            de=self.usuario_remitente
        )
        
        self.assertEqual(notificacion.tipo, 'SUCCESS')
        self.assertEqual(notificacion.para, self.usuario_destinatario)
    
    def test_notificar_multiple(self):
        """Verifica la creación de múltiples notificaciones"""
        usuario_3 = User.objects.create_user(
            username='usuario3',
            email='usuario3@test.com',
            password='testpass123'
        )
        
        usuarios = [self.usuario_destinatario, usuario_3]
        notificaciones = Notificacion.notificar_multiple(
            usuarios=usuarios,
            tipo='SYSTEM',
            asunto='Bulk Notification',
            cuerpo='This notification goes to multiple users' * 2,
            de=self.usuario_remitente
        )
        
        self.assertEqual(len(notificaciones), 2)

