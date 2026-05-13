from rest_framework import serializers
from django.utils.translation import gettext_lazy as _
from ..models.procedure import Procedure
from ..models.user import User


class ProcedureUserSerializer(serializers.ModelSerializer):
    """Datos mínimos del usuario solicitante para anidar en las respuestas de Procedure."""

    class Meta:
        model = User
        fields = ('id', 'username', 'first_name', 'last_name', 'email')


class ProcedureSerializer(serializers.ModelSerializer):
    """Serializer básico para Procedure"""

    state_display = serializers.CharField(source='get_state_display', read_only=True)
    user = ProcedureUserSerializer(read_only=True)
    user_display = serializers.CharField(source='user.get_short_name', read_only=True)
    follow_number = serializers.CharField(source='get_follow_number_display', read_only=True)

    class Meta:
        model = Procedure
        fields = (
            'id', 'numero_seguimiento', 'follow_number',
            'user', 'user_display', 'state', 'state_display',
            'observation', 'deadline', 'is_pending', 'is_completed', 'is_rejected',
            'is_expired', 'created_at', 'updated_at'
        )
        read_only_fields = ('id', 'numero_seguimiento', 'follow_number', 'created_at', 'updated_at')


class ProcedureDetailSerializer(ProcedureSerializer):
    """Serializer detallado para Procedure con información completa"""

    class Meta(ProcedureSerializer.Meta):
        fields = ProcedureSerializer.Meta.fields + (
            'can_edit', 'can_submit'
        )


class ProcedureListSerializer(serializers.ModelSerializer):
    """Serializer optimizado para listar Procedures"""

    state_display = serializers.CharField(source='get_state_display', read_only=True)
    user = ProcedureUserSerializer(read_only=True)
    user_display = serializers.CharField(source='user.get_short_name', read_only=True)
    follow_number = serializers.CharField(source='get_follow_number_display', read_only=True)

    class Meta:
        model = Procedure
        fields = (
            'id', 'numero_seguimiento', 'follow_number',
            'user', 'user_display', 'state', 'state_display',
            'observation', 'deadline', 'is_expired', 'created_at', 'updated_at',
        )


