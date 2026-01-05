from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.platform.views.user import UsuarioViewSet

# Router específico para Comment
router = DefaultRouter()
router.register(r'users', UsuarioViewSet, basename='users')

urlpatterns = [
    path('', include(router.urls)),
]