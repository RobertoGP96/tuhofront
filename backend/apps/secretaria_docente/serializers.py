from rest_framework import serializers
from .models import Tramite 
from usuarios.serializers import UsuarioSerializer


class TramiteSerializer(serializers.ModelSerializer):
    usuario_info = UsuarioSerializer(source='usuario', read_only=True)
    
    class Meta:
        model = Tramite
        fields = '__all__'
        read_only_fields = ('numero_seguimiento', 'fecha', 'created_at', 'updated_at')
    
    def create(self, validated_data):
        # Generar número de seguimiento automáticamente
        import uuid
        validated_data['numero_seguimiento'] = str(uuid.uuid4())[:8].upper()
        return super().create(validated_data)
        
