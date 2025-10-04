from rest_framework import serializers
from drf_spectacular.utils import extend_schema_field
from .models import Notificacion
from usuarios.serializers import UsuarioSerializer

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
        from datetime import datetime
        
        if obj.creado:
            # Convertir fecha a datetime para calcular diferencia
            created_datetime = datetime.combine(obj.creado, datetime.min.time())
            now = timezone.now().replace(tzinfo=None)
            diff = now - created_datetime
            
            if diff.days > 0:
                return f"Hace {diff.days} días"
            elif diff.seconds > 3600:
                hours = diff.seconds // 3600
                return f"Hace {hours} horas"
            elif diff.seconds > 60:
                minutes = diff.seconds // 60
                return f"Hace {minutes} minutos"
            else:
                return "Hace unos momentos"
        return "Fecha desconocida"