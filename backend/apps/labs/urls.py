"""
URLs para el sistema de reserva de locales universitarios.
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import LocalViewSet, LocalReservationViewSet

# Router para los ViewSets
router = DefaultRouter()
router.register(r'locals', LocalViewSet, basename='local')
router.register(r'reservations', LocalReservationViewSet, basename='reservation')

app_name = 'local_reservations'

urlpatterns = [
    path('', include(router.urls)),
]

"""
Esto generará los siguientes endpoints:

LOCALES:
========
GET     /api/locals/                        - Listar todos los locales
POST    /api/locals/                        - Crear nuevo local (admin)
GET     /api/locals/{id}/                   - Detalle de un local
PUT     /api/locals/{id}/                   - Actualizar local completo (admin)
PATCH   /api/locals/{id}/                   - Actualizar local parcial (admin)
DELETE  /api/locals/{id}/                   - Eliminar local (admin)

GET     /api/locals/active/                 - Listar solo locales activos
POST    /api/locals/{id}/availability/      - Verificar disponibilidad
GET     /api/locals/{id}/reservations/      - Reservas del local
GET     /api/locals/{id}/statistics/        - Estadísticas del local
GET     /api/locals/{id}/calendar/          - Calendario de reservas


RESERVAS:
=========
GET     /api/reservations/                  - Listar reservas (propias o todas si es staff)
POST    /api/reservations/                  - Crear nueva reserva
GET     /api/reservations/{id}/             - Detalle de una reserva
PUT     /api/reservations/{id}/             - Actualizar reserva completa
PATCH   /api/reservations/{id}/             - Actualizar reserva parcial
DELETE  /api/reservations/{id}/             - Eliminar reserva

GET     /api/reservations/my_reservations/  - Mis reservas
GET     /api/reservations/pending/          - Pendientes de aprobación (staff)
GET     /api/reservations/upcoming/         - Próximas reservas aprobadas
GET     /api/reservations/active/           - Reservas activas (en curso)

POST    /api/reservations/{id}/submit/      - Enviar para aprobación
POST    /api/reservations/{id}/approve/     - Aprobar reserva (staff)
POST    /api/reservations/{id}/reject/      - Rechazar reserva (staff)
POST    /api/reservations/{id}/cancel/      - Cancelar reserva
GET     /api/reservations/{id}/history/     - Historial de cambios


FILTROS DISPONIBLES:
====================

Locales:
- ?local_type=AULA
- ?is_active=true
- ?requires_approval=true
- ?search=aula
- ?ordering=code

Reservas:
- ?state=APROBADA
- ?purpose=CLASE
- ?local={id}
- ?user={id}
- ?search=Juan
- ?ordering=-start_time


EJEMPLO DE USO EN settings.py:
===============================

INSTALLED_APPS = [
    ...
    'rest_framework',
    'django_filters',
    'your_app',
]

REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_FILTER_BACKENDS': [
        'django_filters.rest_framework.DjangoFilterBackend',
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 10,
}


EJEMPLO DE USO EN urls.py principal:
=====================================

from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('your_app.urls')),
    path('api-auth/', include('rest_framework.urls')),
]
"""