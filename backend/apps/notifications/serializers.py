from rest_framework import serializers
from drf_spectacular.utils import extend_schema_field
from .models import Notificacion
from apps.platform.serializers.user import UserSerializer

class NotificacionSerializer(serializers.ModelSerializer):
    """
    Serializer para el modelo Notificación.
    
    Maneja las notificaciones del sistema, incluyendo información del destinatario
    y estado de lectura.
    """
    
    para_info = UsuarioSerializer(source='para', read_only=True)
    tiempo_transcurrido = serializers.SerializerMethodField()
    
    class Meta:
        model = Notificacion
        fields = '__all__'
        
    @extend_schema_field(serializers.CharField)
    def get_tiempo_transcurrido(self, obj):
        """Retorna el tiempo transcurrido desde la creación de la notificación."""
        from django.utils import timezone
        from django.utils.timesince import timesince
        
        if obj.created_at:
            return timesince(obj.created_at, timezone.now())
        return "Fecha desconocida"