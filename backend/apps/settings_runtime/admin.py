from django.contrib import admin

from .models import SystemSettings


@admin.register(SystemSettings)
class SystemSettingsAdmin(admin.ModelAdmin):
    list_display = ('institution_name', 'institution_short_name', 'updated_at', 'updated_by')
    readonly_fields = ('updated_at', 'updated_by')

    def has_add_permission(self, request):
        # Singleton: evita añadir un segundo
        return not SystemSettings.objects.exists()

    def has_delete_permission(self, request, obj=None):
        return False
