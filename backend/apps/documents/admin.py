from django.contrib import admin

from .models import OfficialDocument


@admin.register(OfficialDocument)
class OfficialDocumentAdmin(admin.ModelAdmin):
    list_display = ('title', 'verification_code', 'doc_type', 'resource_type', 'resource_id', 'issued_to', 'created_at', 'revoked')
    list_filter = ('doc_type', 'revoked', 'created_at')
    search_fields = ('verification_code', 'title', 'resource_id', 'issued_to__username')
    readonly_fields = ('verification_code', 'created_at')
    date_hierarchy = 'created_at'
