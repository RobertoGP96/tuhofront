from django.contrib import admin

from .models import AuditLog


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ('created_at', 'user', 'action', 'resource_type', 'resource_id', 'ip_address')
    list_filter = ('action', 'resource_type', 'created_at')
    search_fields = ('user__username', 'user__email', 'resource_id', 'description', 'ip_address')
    readonly_fields = (
        'user', 'action', 'resource_type', 'resource_id',
        'description', 'metadata', 'ip_address', 'user_agent', 'created_at',
    )
    date_hierarchy = 'created_at'
    ordering = ('-created_at',)

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=None):
        # Solo superusers pueden purgar (idealmente, nunca)
        return request.user.is_superuser
