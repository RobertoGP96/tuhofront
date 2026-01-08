from django.contrib import admin

# Import the model directly since we've fixed the circular imports
from .models.procedure import SecretaryDocProcedure

# Register your models here.
@admin.register(SecretaryDocProcedure)
class SecretaryDocProcedureAdmin(admin.ModelAdmin):
    """Admin configuration for the SecretaryDocProcedure model."""
    list_display = ('id', 'get_full_name', 'email', 'state', 'created_at')
    list_filter = ('state', 'created_at')
    search_fields = ('id_card', 'email', 'full_name')
    date_hierarchy = 'created_at'
    
    def get_full_name(self, obj):
        return obj.full_name
    get_full_name.short_description = 'Nombre Completo'

