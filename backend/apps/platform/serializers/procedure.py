from rest_framework import serializers
from django.utils.translation import gettext_lazy as _
from ..models.procedure import Procedure


class ProcedureSerializer(serializers.ModelSerializer):
    """Serializer básico para Procedure"""
    
    state_display = serializers.CharField(source='get_state_display', read_only=True)
    user_display = serializers.CharField(source='user.get_short_name', read_only=True)
    
    class Meta:
        model = Procedure
        fields = (
            'id', 'numero_seguimiento', 'user', 'user_display', 'state', 'state_display',
            'observation', 'deadline', 'is_pending', 'is_completed', 'is_rejected',
            'is_expired', 'created_at', 'updated_at'
        )
        read_only_fields = ('id', 'numero_seguimiento', 'created_at', 'updated_at')


class ProcedureDetailSerializer(ProcedureSerializer):
    """Serializer detallado para Procedure con información completa"""
    
    class Meta(ProcedureSerializer.Meta):
        fields = ProcedureSerializer.Meta.fields + (
            'can_edit', 'can_submit'
        )


class ProcedureListSerializer(serializers.ModelSerializer):
    """Serializer optimizado para listar Procedures"""
    
    state_display = serializers.CharField(source='get_state_display', read_only=True)
    user_display = serializers.CharField(source='user.get_short_name', read_only=True)
    
    class Meta:
        model = Procedure
        fields = (
            'id', 'numero_seguimiento', 'user_display', 'state', 'state_display',
            'deadline', 'is_expired', 'created_at'
        )


