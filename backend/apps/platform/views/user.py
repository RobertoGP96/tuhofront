from datetime import datetime, timedelta

from django.conf import settings
from django.db.models import Count, Q
from django.shortcuts import get_object_or_404
from django.utils.translation import gettext_lazy as _
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.filters import OrderingFilter, SearchFilter
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView

from apps.audit.services import log_event
from apps.notifications.services import notify

from ..models.user import User
from ..permissions import IsOwnerOrStaff, IsStaffUser
from ..serializers.user import (
    ActivateAccountSerializer,
    BulkUserActionSerializer,
    ChangePasswordSerializer,
    ResetPasswordConfirmSerializer,
    ResetPasswordSerializer,
    UserCreateSerializer,
    UserDetailSerializer,
    UserListSerializer,
    UserStaffSerializer,
    UserStatsSerializer,
    UserUpdateSerializer,
    VerifyPhoneSerializer,
)


class RegisterThrottle(ScopedRateThrottle):
    scope = 'register'


class PasswordResetThrottle(ScopedRateThrottle):
    scope = 'password_reset'


def _build_activation_url(token: str) -> str:
    frontend = getattr(settings, 'FRONTEND_URL', '').rstrip('/')
    return f'{frontend}/activate?token={token}' if frontend else f'/activate?token={token}'


def _build_reset_url(token: str) -> str:
    frontend = getattr(settings, 'FRONTEND_URL', '').rstrip('/')
    return f'{frontend}/reset-password?token={token}' if frontend else f'/reset-password?token={token}'


def _send_activation_email(user) -> None:
    if not user.email:
        return
    token = user.generate_activation_token()
    notify(
        user,
        subject='Activa tu cuenta en TUho',
        body=f'Hola {user.get_full_name() or user.username}, usa este enlace para activar tu cuenta: {_build_activation_url(token)}',
        tipo='SYSTEM',
        prioridad='HIGH',
        email_template='emails/account_activation.html',
        email_context={
            'user': user,
            'activation_url': _build_activation_url(token),
            'institution_name': getattr(settings, 'INSTITUTION_NAME', 'Universidad'),
            'expires_hours': 48,
        },
    )


def _send_reset_email(user) -> None:
    if not user.email:
        return
    token = user.generate_activation_token()
    notify(
        user,
        subject='Restablece tu contraseña en TUho',
        body=f'Hola {user.get_full_name() or user.username}, restablece tu contraseña aquí: {_build_reset_url(token)}',
        tipo='SYSTEM',
        prioridad='HIGH',
        email_template='emails/password_reset.html',
        email_context={
            'user': user,
            'reset_url': _build_reset_url(token),
            'institution_name': getattr(settings, 'INSTITUTION_NAME', 'Universidad'),
            'expires_hours': 2,
        },
    )


class UserViewSet(viewsets.ModelViewSet):
    """Gestión completa de usuarios."""

    queryset = User.objects.all()
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['user_type', 'is_active', 'is_staff', 'email_verified', 'phone_verified']
    search_fields = ['username', 'email', 'first_name', 'last_name', 'id_card']
    ordering_fields = ['date_joined', 'username', 'email', 'user_type']
    ordering = ['-date_joined']

    def get_serializer_class(self):
        if self.action == 'list':
            return UserListSerializer
        if self.action == 'create':
            return UserCreateSerializer
        if self.action in ['update', 'partial_update']:
            return UserUpdateSerializer
        if self.action == 'change_password':
            return ChangePasswordSerializer
        if self.action == 'activate':
            return ActivateAccountSerializer
        if self.action == 'verify_phone':
            return VerifyPhoneSerializer
        return UserDetailSerializer

    def get_permissions(self):
        if self.action == 'create':
            return [permissions.AllowAny()]
        if self.action in ['update', 'partial_update', 'change_password']:
            return [IsOwnerOrStaff()]
        if self.action in ['destroy', 'bulk_actions']:
            return [IsStaffUser()]
        if self.action in ['activate', 'resend_activation']:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def get_throttles(self):
        if self.action == 'create':
            return [RegisterThrottle()]
        return super().get_throttles()

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return User.objects.none()
        if user.is_staff:
            return User.objects.all()
        return User.objects.filter(id=user.id)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        # Por defecto los nuevos usuarios no están activos hasta validar email
        if user.is_active:
            user.is_active = False
            user.save(update_fields=['is_active'])

        _send_activation_email(user)
        log_event(
            action='create',
            resource=user,
            description=f'Usuario registrado: {user.username}',
        )

        return Response(
            {
                'message': _('Usuario creado. Revisa tu email para activar la cuenta.'),
                'user': UserDetailSerializer(user).data,
            },
            status=status.HTTP_201_CREATED,
        )

    @action(detail=False, methods=['get'])
    def me(self, request):
        serializer = UserDetailSerializer(request.user)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def change_password(self, request, pk=None):
        user = self.get_object()
        serializer = ChangePasswordSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            user.set_password(serializer.validated_data['new_password'])
            user.save()
            log_event(action='update', resource=user, description='Cambio de contraseña')
            return Response({'message': _('Contraseña actualizada exitosamente.')})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'], permission_classes=[permissions.AllowAny])
    def activate(self, request):
        serializer = ActivateAccountSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        token = serializer.validated_data['activation_token']
        try:
            user = User.objects.get(activation_token=token)
        except User.DoesNotExist:
            return Response({'error': _('Token inválido o expirado.')}, status=status.HTTP_400_BAD_REQUEST)

        if not user.is_activation_token_valid():
            return Response(
                {'error': _('El token de activación ha expirado. Solicita uno nuevo.')},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user.activate_account()
        log_event(action='user_activation', resource=user, description='Cuenta activada vía email')
        return Response({'message': _('Cuenta activada exitosamente.')})

    @action(detail=True, methods=['post'])
    def verify_phone(self, request, pk=None):
        user = self.get_object()
        serializer = VerifyPhoneSerializer(data=request.data)
        if serializer.is_valid():
            user.verify_phone()
            return Response({'message': _('Teléfono verificado exitosamente.')})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'], permission_classes=[permissions.AllowAny], throttle_classes=[RegisterThrottle])
    def resend_activation(self, request):
        """Reenviar email de activación dado un email."""
        email = request.data.get('email', '').strip().lower()
        if not email:
            return Response({'error': _('Debe proporcionar un email.')}, status=status.HTTP_400_BAD_REQUEST)
        try:
            user = User.objects.get(email__iexact=email)
        except User.DoesNotExist:
            # Respuesta genérica para no revelar existencia de cuentas
            return Response({'message': _('Si el email existe, se ha enviado la activación.')})
        if user.is_active:
            return Response({'message': _('Si el email existe, se ha enviado la activación.')})
        _send_activation_email(user)
        return Response({'message': _('Si el email existe, se ha enviado la activación.')})


class PasswordResetView(APIView):
    permission_classes = [permissions.AllowAny]
    throttle_classes = [PasswordResetThrottle]

    def post(self, request):
        serializer = ResetPasswordSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        email = serializer.validated_data['email']
        try:
            user = User.objects.get(email__iexact=email)
            _send_reset_email(user)
            log_event(action='password_reset', resource=user, description='Solicitud de reset')
        except User.DoesNotExist:
            pass  # respuesta genérica
        return Response({'message': _('Si el email existe, se ha enviado instrucciones.')})


class PasswordResetConfirmView(APIView):
    permission_classes = [permissions.AllowAny]
    throttle_classes = [PasswordResetThrottle]

    def post(self, request):
        serializer = ResetPasswordConfirmSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        token = serializer.validated_data['token']
        try:
            user = User.objects.get(activation_token=token)
        except User.DoesNotExist:
            return Response({'error': _('Token inválido o expirado.')}, status=status.HTTP_400_BAD_REQUEST)

        if not user.is_activation_token_valid():
            return Response(
                {'error': _('El token de recuperación ha expirado. Solicita uno nuevo.')},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user.set_password(serializer.validated_data['new_password'])
        user.activation_token = None
        user.activation_token_expires_at = None
        user.save()
        log_event(action='password_reset', resource=user, description='Contraseña restablecida')
        return Response({'message': _('Contraseña actualizada exitosamente.')})


class UserStaffViewSet(viewsets.ModelViewSet):
    """Gestión avanzada de usuarios por staff."""

    queryset = User.objects.all()
    serializer_class = UserStaffSerializer
    permission_classes = [IsStaffUser]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['user_type', 'is_active', 'is_staff', 'email_verified']
    search_fields = ['username', 'email', 'first_name', 'last_name', 'id_card']
    ordering_fields = ['date_joined', 'username', 'last_login']
    ordering = ['-date_joined']

    @action(detail=False, methods=['post'])
    def bulk_actions(self, request):
        serializer = BulkUserActionSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        user_ids = serializer.validated_data['user_ids']
        action_type = serializer.validated_data['action']

        users = User.objects.filter(id__in=user_ids).exclude(id=request.user.id)

        message = None
        audit_action = None
        if action_type == 'activate':
            users.update(is_active=True)
            audit_action = 'user_activation'
            message = _('Usuarios activados exitosamente.')
        elif action_type == 'deactivate':
            users.update(is_active=False)
            audit_action = 'user_deactivation'
            message = _('Usuarios desactivados exitosamente.')
        elif action_type == 'verify_email':
            users.update(email_verified=True)
            audit_action = 'update'
            message = _('Emails verificados exitosamente.')
        elif action_type == 'delete':
            count = users.count()
            ids = list(users.values_list('id', flat=True))
            users.delete()
            audit_action = 'delete'
            message = _(f'{count} usuarios eliminados exitosamente.')
            log_event(
                action=audit_action,
                resource_type='platform.User',
                resource_id=','.join(str(x) for x in ids),
                description='Eliminación masiva de usuarios',
                metadata={'count': count, 'ids': [str(x) for x in ids]},
            )
            return Response({'message': message})

        if audit_action:
            log_event(
                action=audit_action,
                resource_type='platform.User',
                resource_id='bulk',
                description=f'Acción masiva: {action_type}',
                metadata={'action': action_type, 'count': users.count()},
            )

        return Response({'message': message})

    @action(detail=False, methods=['get'])
    def statistics(self, request):
        total_users = User.objects.count()
        active_users = User.objects.filter(is_active=True).count()
        verified_users = User.objects.filter(email_verified=True, phone_verified=True).count()
        users_by_type = dict(
            User.objects.values('user_type').annotate(count=Count('id')).values_list('user_type', 'count')
        )
        thirty_days_ago = datetime.now() - timedelta(days=30)
        recent_registrations = User.objects.filter(date_joined__gte=thirty_days_ago).count()

        stats = {
            'total_users': total_users,
            'active_users': active_users,
            'inactive_users': total_users - active_users,
            'verified_users': verified_users,
            'users_by_type': users_by_type,
            'recent_registrations': recent_registrations,
        }
        serializer = UserStatsSerializer(stats)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def force_activate(self, request, pk=None):
        user = self.get_object()
        user.activate_account()
        log_event(action='user_activation', resource=user, description='Activación forzada por admin')
        return Response({'message': _('Usuario activado exitosamente.')})

    @action(detail=True, methods=['post'])
    def reset_password_admin(self, request, pk=None):
        user = self.get_object()
        new_password = request.data.get('new_password')
        if not new_password:
            return Response({'error': _('Debe proporcionar una nueva contraseña.')}, status=status.HTTP_400_BAD_REQUEST)
        user.set_password(new_password)
        user.save()
        log_event(action='password_reset', resource=user, description='Reset por admin')
        return Response({'message': _('Contraseña actualizada exitosamente.')})

    @action(detail=True, methods=['get'])
    def activity_log(self, request, pk=None):
        """Retorna las últimas 100 entradas de audit log del usuario."""
        user = self.get_object()
        from apps.audit.models import AuditLog
        from apps.audit.serializers import AuditLogSerializer
        logs = AuditLog.objects.filter(user=user).order_by('-created_at')[:100]
        return Response({
            'user_id': user.id,
            'last_login': user.last_login,
            'date_joined': user.date_joined,
            'is_active': user.is_active,
            'activity_log': AuditLogSerializer(logs, many=True).data,
        })


class UserSearchView(APIView):
    """Búsqueda paginada de usuarios. Acceso solo staff/admin."""

    permission_classes = [IsStaffUser]

    def get(self, request):
        from ..pagination import StandardResultsSetPagination

        query = request.query_params.get('q', '')
        user_type = request.query_params.get('user_type', '')
        is_active = request.query_params.get('is_active', '')

        users = User.objects.all().order_by('-date_joined')
        if query:
            users = users.filter(
                Q(username__icontains=query)
                | Q(email__icontains=query)
                | Q(first_name__icontains=query)
                | Q(last_name__icontains=query)
                | Q(id_card__icontains=query)
            )
        if user_type:
            users = users.filter(user_type=user_type)
        if is_active:
            users = users.filter(is_active=is_active.lower() == 'true')

        paginator = StandardResultsSetPagination()
        page = paginator.paginate_queryset(users, request, view=self)
        if page is not None:
            serializer = UserListSerializer(page, many=True)
            return paginator.get_paginated_response(serializer.data)

        # Fallback (paginator no aplicó): tope de seguridad.
        serializer = UserListSerializer(users[:50], many=True)
        return Response({'count': users.count(), 'results': serializer.data, 'next': None, 'previous': None})
