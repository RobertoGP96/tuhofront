from rest_framework import permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.audit.services import log_event

from .models import SystemSettings
from .serializers import SystemSettingsSerializer


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def public_settings(request):
    """Devuelve sólo los campos que el frontend necesita mostrar sin auth."""
    s = SystemSettings.load()
    return Response({
        'institution_name': s.institution_name,
        'institution_short_name': s.institution_short_name,
        'institution_address': s.institution_address,
        'institution_website': s.institution_website,
        'support_email': s.support_email,
        'modules': {
            'internal': s.module_internal_enabled,
            'secretary': s.module_secretary_enabled,
            'labs': s.module_labs_enabled,
            'news': s.module_news_enabled,
        },
        'reservation': {
            'min_minutes': s.reservation_min_minutes,
            'max_minutes': s.reservation_max_minutes,
            'open_hour': s.reservation_open_hour,
            'close_hour': s.reservation_close_hour,
            'advance_days': s.reservation_advance_days,
        },
    })


class SystemSettingsView(APIView):
    """GET/PATCH de la configuración completa (solo staff)."""
    permission_classes = [permissions.IsAuthenticated, permissions.IsAdminUser]

    def get(self, request):
        s = SystemSettings.load()
        return Response(SystemSettingsSerializer(s).data)

    def patch(self, request):
        s = SystemSettings.load()
        serializer = SystemSettingsSerializer(s, data=request.data, partial=True)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        serializer.save(updated_by=request.user)
        log_event(
            action='update',
            resource=s,
            description='Configuración actualizada',
            metadata={'keys': list(request.data.keys())},
        )
        return Response(serializer.data)
