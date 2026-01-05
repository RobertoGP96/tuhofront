from django.urls import path, include
from rest_framework.routers import DefaultRouter
from ..views.area import AreaViewSet

# Router específico para Areas
router = DefaultRouter()
router.register(r'', AreaViewSet, basename='areas')

urlpatterns = [
    path('', include(router.urls)),
]
