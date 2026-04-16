from django_filters import rest_framework as filters
from rest_framework import permissions, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import AuditLog
from .serializers import AuditLogSerializer


class AuditLogFilter(filters.FilterSet):
    user = filters.NumberFilter(field_name='user_id')
    action = filters.CharFilter(field_name='action')
    resource_type = filters.CharFilter(field_name='resource_type')
    resource_id = filters.CharFilter(field_name='resource_id')
    date_from = filters.DateTimeFilter(field_name='created_at', lookup_expr='gte')
    date_to = filters.DateTimeFilter(field_name='created_at', lookup_expr='lte')

    class Meta:
        model = AuditLog
        fields = ['user', 'action', 'resource_type', 'resource_id']


class AuditLogViewSet(viewsets.ReadOnlyModelViewSet):
    """Bitácora de auditoría — solo admins pueden consultar."""
    queryset = AuditLog.objects.all().select_related('user')
    serializer_class = AuditLogSerializer
    permission_classes = [permissions.IsAuthenticated, permissions.IsAdminUser]
    filter_backends = [filters.DjangoFilterBackend]
    filterset_class = AuditLogFilter

    @action(detail=False, methods=['get'], url_path='resource/(?P<app_label>[^/.]+)/(?P<model>[^/.]+)/(?P<pk>[^/.]+)',
            permission_classes=[permissions.IsAuthenticated])
    def resource_history(self, request, app_label=None, model=None, pk=None):
        """Historial de un recurso específico.

        Accesible por el dueño del recurso o staff. El viewset global
        requiere admin, pero este endpoint permite al usuario ver los
        cambios de sus propios trámites.
        """
        resource_type = f'{app_label}.{model}'
        logs = AuditLog.objects.filter(
            resource_type__iexact=resource_type,
            resource_id=str(pk),
        ).order_by('-created_at').select_related('user')

        # Verifica permiso: staff o dueño
        if not request.user.is_staff:
            from django.apps import apps as django_apps
            try:
                Model = django_apps.get_model(app_label, model)
                resource = Model.objects.filter(pk=pk).first()
            except LookupError:
                resource = None
            if not resource:
                return Response([], status=404)
            owner_id = (
                getattr(resource, 'user_id', None)
                or getattr(resource, 'created_by_id', None)
            )
            if owner_id != request.user.id:
                return Response({'detail': 'No autorizado.'}, status=403)

        return Response(AuditLogSerializer(logs[:200], many=True).data)
