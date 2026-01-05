from django.urls import path, include
from rest_framework.routers import DefaultRouter
from ..views import department

# Router específico para Departments
router = DefaultRouter()
router.register(r'', department.DepartmentViewSet, basename='departments')

urlpatterns = [
    path('', include(router.urls)),
]