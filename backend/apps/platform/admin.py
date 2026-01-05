from django.contrib import admin
from .models.area import Area
from .models.department import Department
from .models.news import News
from .models.user import User
from .models.procedure import Procedure

from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.translation import gettext_lazy as _
from django.utils.html import format_html
from django.urls import reverse
from django.db.models import Q
# Register your models here.

admin.site.register(News)
admin.site.register(Department)
admin.site.register(Area)

@admin.register(Procedure)
class ProcedureAdmin(admin.ModelAdmin):
    """
    Admin personalizado para el modelo Procedure.
    Permite visualizar y gestionar trámites generales y monitorear sus estados.
    """
    
    # Campos a mostrar en la lista
    list_display = [
        'numero_seguimiento', 'user', 'state', 'created_at_display', 'deadline_display'
    ]
    
    # Campos por los que se puede filtrar
    list_filter = [
        'state', 'created_at', 'updated_at', 'deadline'
    ]
    
    # Campos de búsqueda
    search_fields = [
        'numero_seguimiento', 'user__username', 'user__email', 'observation'
    ]
    
    # Ordenamiento por defecto
    ordering = ['-created_at']
    
    # Campos de solo lectura
    readonly_fields = [
        'id', 'numero_seguimiento', 'created_at', 'updated_at'
    ]
    
    # Configuración de los fieldsets
    fieldsets = (
        (_('Información principal'), {
            'fields': ('id', 'numero_seguimiento', 'user')
        }),
        (_('Detalles del trámite'), {
            'fields': ('state', 'deadline', 'observation')
        }),
        (_('Auditoría'), {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    # Fieldsets para creación
    add_fieldsets = (
        (_('Información principal'), {
            'classes': ('wide',),
            'fields': ('user', 'state')
        }),
        (_('Detalles del trámite'), {
            'classes': ('wide',),
            'fields': ('deadline', 'observation')
        }),
    )
    
    # Acciones en lote
    actions = ['mark_as_submitted', 'mark_as_in_process', 'mark_as_approved', 'mark_as_rejected']
    
    def created_at_display(self, obj):
        """Muestra la fecha de creación formateada"""
        return obj.created_at.strftime('%d/%m/%Y %H:%M')
    created_at_display.short_description = _('Fecha de creación')
    
    def deadline_display(self, obj):
        """Muestra la fecha límite con color según estado"""
        if not obj.deadline:
            return "—"
        
        from django.utils import timezone
        if obj.is_expired:
            return format_html(
                '<span style="color: red;">✗ Vencido ({0.strftime(\'%d/%m/%Y\')})</span>',
                obj.deadline
            )
        return obj.deadline.strftime('%d/%m/%Y')
    deadline_display.short_description = _('Fecha límite')
    
    @admin.action(description=_('Marcar como enviado'))
    def mark_as_submitted(self, request, queryset):
        """Marca trámites como enviados"""
        updated = queryset.update(state='ENVIADO')
        self.message_user(request, _(f'{updated} trámites marcados como enviados.'))
    
    @admin.action(description=_('Marcar como en proceso'))
    def mark_as_in_process(self, request, queryset):
        """Marca trámites como en proceso"""
        updated = queryset.update(state='EN_PROCESO')
        self.message_user(request, _(f'{updated} trámites marcados como en proceso.'))
    
    @admin.action(description=_('Marcar como aprobado'))
    def mark_as_approved(self, request, queryset):
        """Marca trámites como aprobados"""
        updated = queryset.update(state='APROBADO')
        self.message_user(request, _(f'{updated} trámites marcados como aprobados.'))
    
    @admin.action(description=_('Marcar como rechazado'))
    def mark_as_rejected(self, request, queryset):
        """Marca trámites como rechazados"""
        updated = queryset.update(state='RECHAZADO')
        self.message_user(request, _(f'{updated} trámites marcados como rechazados.'))
    
    def get_queryset(self, request):
        """Optimiza las queries"""
        qs = super().get_queryset(request)
        return qs.select_related('user')

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """
    Admin personalizado para el modelo Usuario.
    Extiende UserAdmin de Django con campos específicos del modelo.
    """
    
    # Campos a mostrar en la lista
    list_display = [
        'username', 'email', 'full_name_display', 'user_type',
        'is_active_display', 'is_verified_display', 'date_joined'
    ]
    
    # Campos por los que se puede filtrar
    list_filter = [
        'user_type', 'is_active', 'is_staff', 'is_superuser',
        'email_verified', 'phone_verified', 'date_joined'
    ]
    
    # Campos de búsqueda
    search_fields = [
        'username', 'email', 'first_name', 'last_name', 'id_card'
    ]
    
    # Ordenamiento por defecto
    ordering = ['-date_joined']
    
    # Campos de solo lectura
    readonly_fields = [
        'date_joined', 'last_login', 'created_at', 'updated_at',
        'age_display', 'carnet_masked_display'
    ]
    
    # Configuración de los fieldsets (organización de campos)
    fieldsets = (
        (_('Información de acceso'), {
            'fields': ('username', 'password')
        }),
        (_('Información personal'), {
            'fields': (
                'first_name', 'last_name', 'email', 'id_card',
                'carnet_masked_display', 'phone', 'address',
                'date_of_birth', 'age_display', 'workplace'
            )
        }),
        (_('Clasificación'), {
            'fields': ('user_type',)
        }),
        (_('Permisos'), {
            'fields': (
                'is_active', 'is_staff', 'is_superuser',
                'groups', 'user_permissions'
            ),
            'classes': ('collapse',)
        }),
        (_('Verificación'), {
            'fields': ('email_verified', 'phone_verified', 'activation_token')
        }),
        (_('Fechas importantes'), {
            'fields': ('last_login', 'date_joined', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    # Fieldsets para creación de usuario
    add_fieldsets = (
        (_('Información de acceso'), {
            'classes': ('wide',),
            'fields': ('username', 'password1', 'password2'),
        }),
        (_('Información personal'), {
            'classes': ('wide',),
            'fields': (
                'first_name', 'last_name', 'email', 'id_card',
                'phone', 'address', 'date_of_birth'
            ),
        }),
        (_('Clasificación'), {
            'classes': ('wide',),
            'fields': ('user_type',),
        }),
        (_('Permisos'), {
            'classes': ('wide',),
            'fields': ('is_active', 'is_staff', 'is_superuser'),
        }),
    )
    
    # Acciones en lote
    actions = [
        'activate_users',
        'deactivate_users',
        'verify_emails',
        'mark_as_staff',
        'remove_staff_status'
    ]
    
    # Número de resultados por página
    list_per_page = 25
    
    # Campos que se pueden editar directamente desde la lista
    list_editable = []
    
    # Enlaces en la lista
    list_display_links = ['username', 'email']
    
    def full_name_display(self, obj):
        """Muestra el nombre completo"""
        return obj.get_full_name()
    full_name_display.short_description = _('Nombre completo')
    
    def is_active_display(self, obj):
        """Muestra el estado activo con color"""
        if obj.is_active:
            return format_html(
                '<span style="color: green;">✓ Activo</span>'
            )
        return format_html(
            '<span style="color: red;">✗ Inactivo</span>'
        )
    is_active_display.short_description = _('Estado')
    
    def is_verified_display(self, obj):
        """Muestra el estado de verificación"""
        if obj.is_verified:
            return format_html(
                '<span style="color: green;">✓ Verificado</span>'
            )
        return format_html(
            '<span style="color: orange;">⚠ Pendiente</span>'
        )
    is_verified_display.short_description = _('Verificación')
    
    def age_display(self, obj):
        """Muestra la edad del usuario"""
        if obj.age:
            return f"{obj.age} años"
        return "—"
    age_display.short_description = _('Edad')
    
    def carnet_masked_display(self, obj):
        """Muestra el carnet enmascarado"""
        return obj.get_carnet_masked()
    carnet_masked_display.short_description = _('Carnet (enmascarado)')
    
    # Acciones en lote
    @admin.action(description=_('Activar usuarios seleccionados'))
    def activate_users(self, request, queryset):
        """Activa los usuarios seleccionados"""
        updated = queryset.update(is_active=True)
        self.message_user(
            request,
            _(f'{updated} usuarios activados exitosamente.')
        )
    
    @admin.action(description=_('Desactivar usuarios seleccionados'))
    def deactivate_users(self, request, queryset):
        """Desactiva los usuarios seleccionados"""
        updated = queryset.update(is_active=False)
        self.message_user(
            request,
            _(f'{updated} usuarios desactivados exitosamente.')
        )
    
    @admin.action(description=_('Verificar emails de usuarios seleccionados'))
    def verify_emails(self, request, queryset):
        """Verifica los emails de los usuarios seleccionados"""
        updated = queryset.update(email_verified=True)
        self.message_user(
            request,
            _(f'{updated} emails verificados exitosamente.')
        )
    
    @admin.action(description=_('Marcar como staff'))
    def mark_as_staff(self, request, queryset):
        """Marca usuarios como staff"""
        updated = queryset.update(is_staff=True)
        self.message_user(
            request,
            _(f'{updated} usuarios marcados como staff.')
        )
    
    @admin.action(description=_('Remover estado de staff'))
    def remove_staff_status(self, request, queryset):
        """Remueve el estado de staff"""
        updated = queryset.update(is_staff=False)
        self.message_user(
            request,
            _(f'{updated} usuarios removidos del staff.')
        )
    
    def get_queryset(self, request):
        """Optimiza las queries"""
        qs = super().get_queryset(request)
        # Aquí se pueden agregar select_related o prefetch_related si hay relaciones
        return qs
    
    def save_model(self, request, obj, form, change):
        """Lógica personalizada al guardar"""
        if not change:  # Si es un nuevo usuario
            # Se puede agregar lógica adicional aquí
            pass
        
        super().save_model(request, obj, form, change)
    
    def has_delete_permission(self, request, obj=None):
        """Permisos para eliminar"""
        # Solo superusuarios pueden eliminar usuarios
        if obj and obj.is_superuser:
            return request.user.is_superuser
        return super().has_delete_permission(request, obj)


# Registrar en el admin site con configuración adicional
admin.site.site_header = _("Administración del Sistema Universitario")
admin.site.site_title = _("Sistema Universitario")
admin.site.index_title = _("Panel de Administración")