from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.platform.views.department import DepartmentViewSet

# Router específico para Comment
router = DefaultRouter()
router.register(r'departments', DepartmentViewSet, basename='departments')

urlpatterns = [
    path('', include(router.urls)),
]