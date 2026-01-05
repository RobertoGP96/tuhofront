from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.platform.views import DepartmentViewSet

# Router específico para Comment
router = DefaultRouter()
router.register(r'procedures', DepartmentViewSet, basename='procedures')

urlpatterns = [
    path('', include(router.urls)),
]