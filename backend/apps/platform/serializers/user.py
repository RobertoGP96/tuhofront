from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from django.utils.translation import gettext_lazy as _
from ..models.user import User


class UserBaseSerializer(serializers.ModelSerializer):
    """Serializer base con campos comunes del usuario"""
    
    full_name = serializers.CharField(source='get_full_name', read_only=True)
    age = serializers.IntegerField(read_only=True)
    is_verified = serializers.BooleanField(read_only=True)
    carnet_masked = serializers.CharField(source='get_carnet_masked', read_only=True)
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'full_name', 'id_card', 'phone', 'address', 'date_of_birth',
            'user_type', 'workplace', 'age', 'is_verified', 'carnet_masked',
            'email_verified', 'phone_verified', 'is_active', 'date_joined'
        ]
        read_only_fields = ['id', 'date_joined']


class UserListSerializer(serializers.ModelSerializer):
    """Serializer para listar usuarios (vista resumida)"""
    
    full_name = serializers.CharField(source='get_full_name', read_only=True)
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'full_name', 'user_type',
            'is_active', 'is_staff', 'date_joined'
        ]


class UserDetailSerializer(UserBaseSerializer):
    """Serializer detallado del usuario"""
    
    class Meta(UserBaseSerializer.Meta):
        fields = UserBaseSerializer.Meta.fields + [
            'is_staff', 'is_superuser', 'last_login', 'created_at', 'updated_at'
        ]
        read_only_fields = UserBaseSerializer.Meta.read_only_fields + [
            'is_staff', 'is_superuser', 'last_login', 'created_at', 'updated_at'
        ]


class UserCreateSerializer(serializers.ModelSerializer):
    """Serializer para crear nuevos usuarios"""
    
    password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[validate_password],
        style={'input_type': 'password'}
    )
    password_confirm = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'}
    )
    
    class Meta:
        model = User
        fields = [
            'username', 'email', 'password', 'password_confirm',
            'first_name', 'last_name', 'id_card', 'phone', 'address',
            'date_of_birth', 'user_type', 'workplace'
        ]
        extra_kwargs = {
            'email': {'required': True},
            'first_name': {'required': True},
            'last_name': {'required': True},
            'id_card': {'required': True},
        }
    
    def validate(self, attrs):
        """Validaciones del serializer"""
        # Validar que las contraseñas coincidan
        if attrs.get('password') != attrs.get('password_confirm'):
            raise serializers.ValidationError({
                'password_confirm': _('Las contraseñas no coinciden.')
            })
        
        # Validar email único (case-insensitive)
        email = attrs.get('email', '').lower()
        if User.objects.filter(email__iexact=email).exists():
            raise serializers.ValidationError({
                'email': _('Ya existe un usuario con este email.')
            })
        
        # Validar username único
        username = attrs.get('username')
        if User.objects.filter(username=username).exists():
            raise serializers.ValidationError({
                'username': _('Este nombre de usuario ya está en uso.')
            })
        
        return attrs
    
    def create(self, validated_data):
        """Crear usuario con contraseña hasheada"""
        # Remover password_confirm antes de crear
        validated_data.pop('password_confirm')
        
        # Extraer password
        password = validated_data.pop('password')
        
        # Crear usuario
        user = User.objects.create(**validated_data)
        user.set_password(password)
        
        # Generar token de activación
        user.generate_activation_token()
        
        return user


class UserUpdateSerializer(serializers.ModelSerializer):
    """Serializer para actualizar información del usuario"""
    
    class Meta:
        model = User
        fields = [
            'first_name', 'last_name', 'email', 'phone',
            'address', 'date_of_birth', 'workplace'
        ]
    
    def validate_email(self, value):
        """Validar email único excluyendo el usuario actual"""
        user = self.instance
        if User.objects.filter(email__iexact=value).exclude(pk=user.pk).exists():
            raise serializers.ValidationError(_('Ya existe un usuario con este email.'))
        return value.lower()


class ChangePasswordSerializer(serializers.Serializer):
    """Serializer para cambio de contraseña"""
    
    old_password = serializers.CharField(required=True, write_only=True)
    new_password = serializers.CharField(
        required=True,
        write_only=True,
        validators=[validate_password]
    )
    new_password_confirm = serializers.CharField(required=True, write_only=True)
    
    def validate(self, attrs):
        """Validar que las nuevas contraseñas coincidan"""
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError({
                'new_password_confirm': _('Las contraseñas no coinciden.')
            })
        return attrs
    
    def validate_old_password(self, value):
        """Validar que la contraseña actual sea correcta"""
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError(_('La contraseña actual es incorrecta.'))
        return value


class ActivateAccountSerializer(serializers.Serializer):
    """Serializer para activación de cuenta"""
    
    activation_token = serializers.CharField(required=True)
    
    def validate_activation_token(self, value):
        """Validar token de activación"""
        try:
            user = User.objects.get(activation_token=value)
            if user.is_active:
                raise serializers.ValidationError(_('Esta cuenta ya está activada.'))
        except User.DoesNotExist:
            raise serializers.ValidationError(_('Token de activación inválido.'))
        return value


class VerifyPhoneSerializer(serializers.Serializer):
    """Serializer para verificación de teléfono"""
    
    phone = serializers.CharField(required=True)
    verification_code = serializers.CharField(required=True, max_length=6)


class ResetPasswordSerializer(serializers.Serializer):
    """Serializer para solicitud de reseteo de contraseña"""
    
    email = serializers.EmailField(required=True)
    
    def validate_email(self, value):
        """Validar que el email exista"""
        if not User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError(
                _('No existe un usuario con este email.')
            )
        return value.lower()


class ResetPasswordConfirmSerializer(serializers.Serializer):
    """Serializer para confirmar reseteo de contraseña"""
    
    token = serializers.CharField(required=True)
    new_password = serializers.CharField(
        required=True,
        write_only=True,
        validators=[validate_password]
    )
    new_password_confirm = serializers.CharField(required=True, write_only=True)
    
    def validate(self, attrs):
        """Validar que las contraseñas coincidan"""
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError({
                'new_password_confirm': _('Las contraseñas no coinciden.')
            })
        return attrs


class UserStaffSerializer(serializers.ModelSerializer):
    """Serializer para gestión de usuarios por staff/admin"""
    
    full_name = serializers.CharField(source='get_full_name', read_only=True)
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name', 'full_name',
            'id_card', 'phone', 'address', 'date_of_birth', 'user_type',
            'workplace', 'is_active', 'is_staff', 'is_superuser',
            'email_verified', 'phone_verified', 'date_joined', 'last_login'
        ]
        read_only_fields = ['id', 'date_joined', 'last_login']
    
    def update(self, instance, validated_data):
        """Actualizar usuario con permisos de staff"""
        # Solo superusuarios pueden cambiar is_staff e is_superuser
        user = self.context['request'].user
        
        if not user.is_superuser:
            validated_data.pop('is_staff', None)
            validated_data.pop('is_superuser', None)
        
        return super().update(instance, validated_data)


class BulkUserActionSerializer(serializers.Serializer):
    """Serializer para acciones en lote"""
    
    user_ids = serializers.ListField(
        child=serializers.IntegerField(),
        required=True,
        min_length=1
    )
    action = serializers.ChoiceField(
        choices=['activate', 'deactivate', 'delete', 'verify_email'],
        required=True
    )
    
    def validate_user_ids(self, value):
        """Validar que los IDs de usuario existan"""
        existing_ids = User.objects.filter(id__in=value).values_list('id', flat=True)
        if len(existing_ids) != len(value):
            raise serializers.ValidationError(
                _('Algunos IDs de usuario no existen.')
            )
        return value


class UserStatsSerializer(serializers.Serializer):
    """Serializer para estadísticas de usuarios"""
    
    total_users = serializers.IntegerField()
    active_users = serializers.IntegerField()
    inactive_users = serializers.IntegerField()
    verified_users = serializers.IntegerField()
    users_by_type = serializers.DictField()
    recent_registrations = serializers.IntegerField()