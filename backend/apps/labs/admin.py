from django.contrib import admin
from .models import Local, LocalReservation, ReservationHistory


@admin.register(Local)
class LocalAdmin(admin.ModelAdmin):
    list_display = ['name', 'code', 'local_type', 'capacity', 'is_active', 'requires_approval']
    list_filter = ['local_type', 'is_active', 'requires_approval']
    search_fields = ['name', 'code', 'description']
    readonly_fields = ['id', 'created_at', 'updated_at']


@admin.register(LocalReservation)
class LocalReservationAdmin(admin.ModelAdmin):
    list_display = ['local', 'user', 'start_time', 'end_time', 'state', 'approved_by']
    list_filter = ['state', 'local', 'purpose']
    search_fields = ['user__username', 'user__first_name', 'user__last_name', 'local__name', 'local__code']
    raw_id_fields = ['user', 'local', 'approved_by']
    readonly_fields = ['id', 'numero_seguimiento', 'created_at', 'updated_at', 'approved_at']
    date_hierarchy = 'start_time'


@admin.register(ReservationHistory)
class ReservationHistoryAdmin(admin.ModelAdmin):
    list_display = ['reservation', 'user', 'action', 'timestamp']
    list_filter = ['action']
    search_fields = ['reservation__local__name', 'user__username']
    readonly_fields = ['id', 'timestamp']
