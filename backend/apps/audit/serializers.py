from rest_framework import serializers

from .models import AuditLog


class AuditLogSerializer(serializers.ModelSerializer):
    user_username = serializers.CharField(source='user.username', read_only=True)
    user_full_name = serializers.SerializerMethodField()
    action_display = serializers.CharField(source='get_action_display', read_only=True)

    class Meta:
        model = AuditLog
        fields = (
            'id', 'user', 'user_username', 'user_full_name',
            'action', 'action_display', 'resource_type', 'resource_id',
            'description', 'metadata', 'ip_address', 'user_agent', 'created_at',
        )
        read_only_fields = fields

    def get_user_full_name(self, obj):
        return obj.user.get_full_name() if obj.user else None
