from rest_framework import serializers
from drf_spectacular.utils import extend_schema_field
from .models import Usuario

class UsuarioSerializer(serializers.ModelSerializer):
    """
    Serializer para el modelo Usuario.
    
    Proporciona una representación completa del usuario, excluyendo campos sensibles
    como la contraseña y campos internos de administración.
    """
    
    full_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Usuario
        exclude = ['password','last_login','is_staff','is_active','date_joined']
        
    @extend_schema_field(serializers.CharField)
    def get_full_name(self, obj):
        """Retorna el nombre completo del usuario."""
        return f"{obj.first_name} {obj.last_name}".strip()
        