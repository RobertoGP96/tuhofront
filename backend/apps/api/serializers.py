from rest_framework import serializers


from rest_framework import serializers
from .models import Area

class ApiAreaSerializer(serializers.ModelSerializer):
    """
    Serializer para el modelo Area de la API general.
    
    Distinguido del AreaSerializer de internal_procedures para evitar
    conflictos de nombres en la documentación.
    """
    class Meta:
        model = Area
        fields = ['id', 'name', 'description']


class TokenValidationSerializer(serializers.Serializer):
    """Serializer para la validación de tokens de activación."""
    message = serializers.CharField(read_only=True)


class PasswordResetRequestSerializer(serializers.Serializer):
    """Serializer para solicitudes de restablecimiento de contraseña."""
    email = serializers.EmailField(help_text="Email del usuario para restablecer contraseña")


class PasswordResetResponseSerializer(serializers.Serializer):
    """Serializer para respuestas de restablecimiento de contraseña."""
    message = serializers.CharField(read_only=True)


class UserProfileResponseSerializer(serializers.Serializer):
    """Serializer para la respuesta del perfil de usuario."""
    user = serializers.DictField(read_only=True)