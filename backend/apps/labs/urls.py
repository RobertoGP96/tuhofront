"""URLs para el sistema de reserva de locales universitarios."""
from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import LocalViewSet, LocalReservationViewSet
from .views_extensions import (
    CheckInView,
    EquipmentViewSet,
    LocalEquipmentViewSet,
    ReservationSeriesViewSet,
    reservation_ical,
)


router = DefaultRouter()
router.register(r'locals', LocalViewSet, basename='local')
router.register(r'reservations', LocalReservationViewSet, basename='reservation')
router.register(r'equipment', EquipmentViewSet, basename='equipment')
router.register(r'local-equipment', LocalEquipmentViewSet, basename='local-equipment')
router.register(r'series', ReservationSeriesViewSet, basename='series')
router.register(r'checkin', CheckInView, basename='checkin')

app_name = 'labs'

urlpatterns = [
    path('', include(router.urls)),
    path('reservations/<uuid:pk>/ical/', reservation_ical, name='reservation-ical'),
]
