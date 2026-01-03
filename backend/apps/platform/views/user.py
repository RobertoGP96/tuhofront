from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Q, Count
from django.utils.translation import gettext_lazy as _
from django.shortcuts import get_object_or_404
from datetime import datetime, timedelta
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

from .models import User
from .serializers import (
    UsuarioListSerializer,
    UsuarioDetailSerializer,
    UsuarioCreateSerializer,
    UsuarioUpdateSerializer,
    ChangePasswordSerializer,
    ActivateAccountSerializer,
    VerifyPhoneSerializer,
    ResetPasswordSerializer,
    ResetPasswordConfirmSerializer,
    UsuarioStaffSerializer,
    BulkUserActionSerializer,
    UserStatsSerializer
)
from .permissions import IsOwnerOrStaff, IsStaffUser


class UsuarioViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestión completa de usuarios.
    
    Endpoints:
    - GET /usuarios/ - Listar usuarios
    - POST /usuarios/ - Crear usuario
    - GET /usuarios/{id}/ - Detalle de usuario
    - PUT/PATCH /usuarios/{id}/ - Actualizar usuario
    - DELETE /usuarios/{id}/ - Eliminar usuario
    - POST /usuarios/{id}/change_password/ - Cambiar contraseña
    - POST /usuarios/activate/ - Activar cuenta
    - GET /usuarios/me/ - Usuario actual
    """
    
    queryset = Usuario.objects.all()
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['user_type', 'is_active', 'is_staff', 'email_verified', 'phone_verified']
    search_fields = ['username', 'email', 'first_name', 'last_name', 'id_card']
    ordering_fields = ['date_joined', 'username', 'email', 'user_type']
    ordering = ['-date_joined']
    
    def get_serializer_class(self):
        """Retorna el serializer apropiado según la acción"""
        if self.action == 'list':
            return UsuarioListSerializer
        elif self.action == 'create':
            return UsuarioCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return UsuarioUpdateSerializer
        elif self.action == 'change_password':
            return ChangePasswordSerializer
        elif self.action == 'activate':
            return ActivateAccountSerializer
        elif self.action == 'verify_phone':
            return VerifyPhoneSerializer
        return UsuarioDetailSerializer
    
    def get_permissions(self):
        """Permisos según la acción"""
        if self.action == 'create':
            return [permissions.AllowAny()]
        elif self.action in ['update', 'partial_update', 'change_password']:
            return [IsOwnerOrStaff()]
        elif self.action in ['destroy', 'bulk_actions']:
            return [IsStaffUser()]
        elif self.action == 'me':
            return [permissions.IsAuthenticated()]
        return [permissions.IsAuthenticated()]
    
    def get_queryset(self):
        """Filtra queryset según permisos del usuario"""
        user = self.request.user
        
        if not user.is_authenticated:
            return Usuario.objects.none()
        
        # Staff puede ver todos los usuarios
        if user.is_staff:
            return Usuario.objects.all()
        
        # Usuarios normales solo pueden ver su propio perfil
        return Usuario.objects.filter(id=user.id)
    
    def create(self, request, *args, **kwargs):
        """Crear nuevo usuario"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Aquí se podría enviar email de activación
        # send_activation_email(user)
        
        return Response(
            {
                'message': _('Usuario creado exitosamente. Revisa tu email para activar la cuenta.'),
                'user': UsuarioDetailSerializer(user).data
            },
            status=status.HTTP_201_CREATED
        )
    
    @action(detail=False, methods=['get'])
    def me(self, request):
        """Obtiene el perfil del usuario autenticado"""
        serializer = UsuarioDetailSerializer(request.user)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def change_password(self, request, pk=None):
        """Cambiar contraseña del usuario"""
        user = self.get_object()
        serializer = ChangePasswordSerializer(
            data=request.data,
            context={'request': request}
        )
        
        if serializer.is_valid():
            user.set_password(serializer.validated_data['new_password'])
            user.save()
            
            return Response({
                'message': _('Contraseña actualizada exitosamente.')
            })
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['post'])
    def activate(self, request):
        """Activar cuenta con token"""
        serializer = ActivateAccountSerializer(data=request.data)
        
        if serializer.is_valid():
            token = serializer.validated_data['activation_token']
            user = Usuario.objects.get(activation_token=token)
            user.activate_account()
            
            return Response({
                'message': _('Cuenta activada exitosamente.')
            })
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def verify_phone(self, request, pk=None):
        """Verificar número de teléfono"""
        user = self.get_object()
        serializer = VerifyPhoneSerializer(data=request.data)
        
        if serializer.is_valid():
            # Aquí iría la lógica de verificación con código SMS
            # verify_phone_code(user, serializer.validated_data['verification_code'])
            
            user.verify_phone()
            
            return Response({
                'message': _('Teléfono verificado exitosamente.')
            })
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def resend_activation(self, request, pk=None):
        """Reenviar email de activación"""
        user = self.get_object()
        
        if user.is_active:
            return Response(
                {'error': _('Esta cuenta ya está activada.')},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        token = user.generate_activation_token()
        # Aquí se enviaría el email
        # send_activation_email(user, token)
        
        return Response({
            'message': _('Email de activación reenviado.')
        })


class PasswordResetView(APIView):
    """Vista para solicitar reseteo de contraseña"""
    
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = ResetPasswordSerializer(data=request.data)
        
        if serializer.is_valid():
            email = serializer.validated_data['email']
            user = Usuario.objects.get(email__iexact=email)
            
            # Generar token de reseteo
            token = user.generate_activation_token()
            
            # Aquí se enviaría el email con el token
            # send_password_reset_email(user, token)
            
            return Response({
                'message': _('Se ha enviado un email con instrucciones para resetear tu contraseña.')
            })
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PasswordResetConfirmView(APIView):
    """Vista para confirmar reseteo de contraseña"""
    
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = ResetPasswordConfirmSerializer(data=request.data)
        
        if serializer.is_valid():
            token = serializer.validated_data['token']
            
            try:
                user = Usuario.objects.get(activation_token=token)
                user.set_password(serializer.validated_data['new_password'])
                user.activation_token = None
                user.save()
                
                return Response({
                    'message': _('Contraseña actualizada exitosamente.')
                })
            except Usuario.DoesNotExist:
                return Response(
                    {'error': _('Token inválido o expirado.')},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UsuarioStaffViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestión de usuarios por parte del staff.
    Incluye funcionalidades administrativas avanzadas.
    """
    
    queryset = Usuario.objects.all()
    serializer_class = UsuarioStaffSerializer
    permission_classes = [IsStaffUser]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['user_type', 'is_active', 'is_staff', 'email_verified']
    search_fields = ['username', 'email', 'first_name', 'last_name', 'id_card']
    ordering_fields = ['date_joined', 'username', 'last_login']
    ordering = ['-date_joined']
    
    @action(detail=False, methods=['post'])
    def bulk_actions(self, request):
        """Acciones en lote sobre usuarios"""
        serializer = BulkUserActionSerializer(data=request.data)
        
        if serializer.is_valid():
            user_ids = serializer.validated_data['user_ids']
            action_type = serializer.validated_data['action']
            
            users = Usuario.objects.filter(id__in=user_ids)
            
            # Prevenir que se modifiquen a sí mismos
            users = users.exclude(id=request.user.id)
            
            if action_type == 'activate':
                users.update(is_active=True)
                message = _('Usuarios activados exitosamente.')
            elif action_type == 'deactivate':
                users.update(is_active=False)
                message = _('Usuarios desactivados exitosamente.')
            elif action_type == 'verify_email':
                users.update(email_verified=True)
                message = _('Emails verificados exitosamente.')
            elif action_type == 'delete':
                count = users.count()
                users.delete()
                message = _(f'{count} usuarios eliminados exitosamente.')
            
            return Response({'message': message})
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """Estadísticas de usuarios"""
        total_users = Usuario.objects.count()
        active_users = Usuario.objects.filter(is_active=True).count()
        verified_users = Usuario.objects.filter(
            email_verified=True,
            phone_verified=True
        ).count()
        
        # Usuarios por tipo
        users_by_type = dict(
            Usuario.objects.values('user_type').annotate(
                count=Count('id')
            ).values_list('user_type', 'count')
        )
        
        # Registros recientes (últimos 30 días)
        thirty_days_ago = datetime.now() - timedelta(days=30)
        recent_registrations = Usuario.objects.filter(
            date_joined__gte=thirty_days_ago
        ).count()
        
        stats = {
            'total_users': total_users,
            'active_users': active_users,
            'inactive_users': total_users - active_users,
            'verified_users': verified_users,
            'users_by_type': users_by_type,
            'recent_registrations': recent_registrations
        }
        
        serializer = UserStatsSerializer(stats)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def force_activate(self, request, pk=None):
        """Activar usuario sin token (solo staff)"""
        user = self.get_object()
        user.activate_account()
        
        return Response({
            'message': _('Usuario activado exitosamente.')
        })
    
    @action(detail=True, methods=['post'])
    def reset_password_admin(self, request, pk=None):
        """Resetear contraseña de usuario (solo staff)"""
        user = self.get_object()
        new_password = request.data.get('new_password')
        
        if not new_password:
            return Response(
                {'error': _('Debe proporcionar una nueva contraseña.')},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        user.set_password(new_password)
        user.save()
        
        return Response({
            'message': _('Contraseña actualizada exitosamente.')
        })
    
    @action(detail=True, methods=['get'])
    def activity_log(self, request, pk=None):
        """Obtener log de actividad del usuario"""
        user = self.get_object()
        
        # Aquí iría la lógica para obtener el historial de actividad
        # desde un modelo de auditoría si existiera
        
        return Response({
            'user_id': user.id,
            'last_login': user.last_login,
            'date_joined': user.date_joined,
            'is_active': user.is_active,
            # 'activity_log': []  # Implementar según necesidad
        })


class UserSearchView(APIView):
    """Vista para búsqueda avanzada de usuarios"""
    
    permission_classes = [IsStaffUser]
    
    def get(self, request):
        """Búsqueda avanzada de usuarios"""
        query = request.query_params.get('q', '')
        user_type = request.query_params.get('user_type', '')
        is_active = request.query_params.get('is_active', '')
        
        users = Usuario.objects.all()
        
        if query:
            users = users.filter(
                Q(username__icontains=query) |
                Q(email__icontains=query) |
                Q(first_name__icontains=query) |
                Q(last_name__icontains=query) |
                Q(id_card__icontains=query)
            )
        
        if user_type:
            users = users.filter(user_type=user_type)
        
        if is_active:
            users = users.filter(is_active=is_active.lower() == 'true')
        
        serializer = UsuarioListSerializer(users[:50], many=True)  # Limitar a 50 resultados
        
        return Response({
            'count': users.count(),
            'results': serializer.data
        })