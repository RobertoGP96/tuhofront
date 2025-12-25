from rest_framework import serializers
from drf_spectacular.utils import extend_schema_field
from .models import Noticias, Email, TramiteGeneral, EstadosTramites


class NoticiaSerializer(serializers.ModelSerializer):
    """
    Serializer para el modelo Noticias.
    
    Maneja las noticias y anuncios del sistema, incluyendo contenido,
    fechas de publicación y estado de visibilidad.
    """
    
    resumen = serializers.SerializerMethodField()
    fecha_formateada = serializers.SerializerMethodField()
    
    class Meta:
        model = Noticias
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at')
        
    @extend_schema_field(serializers.CharField)
    def get_resumen(self, obj):
        """Retorna un resumen del contenido de la noticia (primeros 150 caracteres)."""
        if obj.contenido:
            return obj.contenido[:150] + "..." if len(obj.contenido) > 150 else obj.contenido
        return ""
        
    @extend_schema_field(serializers.CharField)
    def get_fecha_formateada(self, obj):
        """Retorna la fecha de creación en formato legible."""
        if obj.created_at:
            return obj.created_at.strftime("%d de %B de %Y")
        return ""


class EmailSerializer(serializers.ModelSerializer):
    """
    Serializer para el modelo Email.
    
    Configura los parámetros de email SMTP para el envío de correos
    electrónicos del sistema.
    """
    
    class Meta:
        model = Email
        fields = '__all__'
        extra_kwargs = {
            'smtp_password': {'write_only': True}
        }


class TramiteGeneralSerializer(serializers.ModelSerializer):
    """
    Serializer para el modelo TramiteGeneral.
    
    Maneja los trámites generales del sistema.
    """
    
    class Meta:
        model = TramiteGeneral
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at')


class EstadosTramitesSerializer(serializers.ModelSerializer):
    """
    Serializer para el modelo EstadosTramites.
    
    Define los diferentes estados que pueden tener los trámites
    en el sistema (pendiente, en proceso, completado, etc.).
    """
    
    tramites_count = serializers.SerializerMethodField()
    
    class Meta:
        model = EstadosTramites
        fields = '__all__'
        
    @extend_schema_field(serializers.IntegerField)
    def get_tramites_count(self, obj):
        """Retorna el número de trámites en este estado."""
        # Esta función necesitaría acceso al modelo de trámites relacionado
        # Por ahora retornamos 0 como placeholder
        return 0
        