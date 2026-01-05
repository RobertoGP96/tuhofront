import django_filters
from django.db.models import Q
from ..models.user import User


class UserFilter(django_filters.FilterSet):
    """
    Filtro avanzado para el modelo Usuario.
    Permite filtrado complejo por múltiples campos.
    """
    
    # Búsqueda por texto en múltiples campos
    search = django_filters.CharFilter(method='filter_search', label='Búsqueda')
    
    # Filtros por campos específicos
    username = django_filters.CharFilter(lookup_expr='icontains')
    email = django_filters.CharFilter(lookup_expr='icontains')
    first_name = django_filters.CharFilter(lookup_expr='icontains')
    last_name = django_filters.CharFilter(lookup_expr='icontains')
    id_card = django_filters.CharFilter(lookup_expr='exact')
    
    # Filtros por tipo y estado
    user_type = django_filters.ChoiceFilter(
        choices=User._meta.get_field('user_type').choices
    )
    is_active = django_filters.BooleanFilter()
    is_staff = django_filters.BooleanFilter()
    email_verified = django_filters.BooleanFilter()
    phone_verified = django_filters.BooleanFilter()
    
    # Filtros por rango de fechas
    date_joined_after = django_filters.DateFilter(
        field_name='date_joined',
        lookup_expr='gte',
        label='Registrado después de'
    )
    date_joined_before = django_filters.DateFilter(
        field_name='date_joined',
        lookup_expr='lte',
        label='Registrado antes de'
    )
    
    date_of_birth_after = django_filters.DateFilter(
        field_name='date_of_birth',
        lookup_expr='gte',
        label='Nacido después de'
    )
    date_of_birth_before = django_filters.DateFilter(
        field_name='date_of_birth',
        lookup_expr='lte',
        label='Nacido antes de'
    )
    
    # Filtro por edad (rango)
    age_min = django_filters.NumberFilter(method='filter_age_min', label='Edad mínima')
    age_max = django_filters.NumberFilter(method='filter_age_max', label='Edad máxima')
    
    # Filtros booleanos compuestos
    is_verified = django_filters.BooleanFilter(
        method='filter_is_verified',
        label='Usuario verificado'
    )
    
    # Ordenamiento
    ordering = django_filters.OrderingFilter(
        fields=(
            ('date_joined', 'fecha_registro'),
            ('username', 'usuario'),
            ('email', 'email'),
            ('last_login', 'ultimo_acceso'),
        ),
        field_labels={
            'date_joined': 'Fecha de registro',
            'username': 'Nombre de usuario',
            'email': 'Email',
            'last_login': 'Último acceso',
        }
    )
    
    class Meta:
        model = User
        fields = [
            'username', 'email', 'first_name', 'last_name', 'id_card',
            'user_type', 'is_active', 'is_staff', 'email_verified',
            'phone_verified', 'workplace'
        ]
    
    def filter_search(self, queryset, name, value):
        """
        Búsqueda global en múltiples campos.
        Busca en: username, email, nombre, apellido, carnet.
        """
        return queryset.filter(
            Q(username__icontains=value) |
            Q(email__icontains=value) |
            Q(first_name__icontains=value) |
            Q(last_name__icontains=value) |
            Q(id_card__icontains=value) |
            Q(workplace__icontains=value)
        )
    
    def filter_age_min(self, queryset, name, value):
        """Filtra usuarios con edad mínima"""
        from datetime import date, timedelta
        
        if value:
            max_birth_date = date.today() - timedelta(days=value * 365.25)
            return queryset.filter(date_of_birth__lte=max_birth_date)
        return queryset
    
    def filter_age_max(self, queryset, name, value):
        """Filtra usuarios con edad máxima"""
        from datetime import date, timedelta
        
        if value:
            min_birth_date = date.today() - timedelta(days=(value + 1) * 365.25)
            return queryset.filter(date_of_birth__gte=min_birth_date)
        return queryset
    
    def filter_is_verified(self, queryset, name, value):
        """Filtra usuarios verificados (email y teléfono)"""
        if value:
            return queryset.filter(email_verified=True, phone_verified=True)
        return queryset.filter(
            Q(email_verified=False) | Q(phone_verified=False)
        )


class UsuarioStaffFilter(UserFilter):
    """
    Filtro extendido para staff con más opciones.
    """
    
    # Filtros adicionales para staff
    is_superuser = django_filters.BooleanFilter()
    
    last_login_after = django_filters.DateTimeFilter(
        field_name='last_login',
        lookup_expr='gte',
        label='Último acceso después de'
    )
    last_login_before = django_filters.DateTimeFilter(
        field_name='last_login',
        lookup_expr='lte',
        label='Último acceso antes de'
    )
    
    # Filtro por usuarios sin acceso reciente
    inactive_days = django_filters.NumberFilter(
        method='filter_inactive_days',
        label='Días sin acceso'
    )
    
    class Meta(UserFilter.Meta):
        fields = UserFilter.Meta.fields + ['is_superuser']
    
    def filter_inactive_days(self, queryset, name, value):
        """Filtra usuarios que no han accedido en X días"""
        from datetime import datetime, timedelta
        from django.utils import timezone
        
        if value:
            threshold_date = timezone.now() - timedelta(days=value)
            return queryset.filter(
                Q(last_login__lte=threshold_date) | Q(last_login__isnull=True)
            )
        return queryset