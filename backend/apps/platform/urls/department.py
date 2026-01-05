from django.urls import path, include
from rest_framework.routers import DefaultRouter
from ..views import department

# Router específico para Comment
router = DefaultRouter()
router.register(r'departments', department.DepartmentViewSet, basename='departments')

urlpatterns = [
    path('', include(router.urls)),
]