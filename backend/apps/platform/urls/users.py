from django.urls import path, include
from rest_framework.routers import DefaultRouter
from ..views.user import UserViewSet

# Router específico para Users
router = DefaultRouter()
router.register(r'', UserViewSet, basename='users')

urlpatterns = [
    path('', include(router.urls)),
]