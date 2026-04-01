from django.urls import path, include
from rest_framework.routers import DefaultRouter
from ..views.user import UserViewSet, PasswordResetView, PasswordResetConfirmView

# Router específico para Users
router = DefaultRouter()
router.register(r'', UserViewSet, basename='users')

urlpatterns = [
    path('', include(router.urls)),
    path('password-reset/', PasswordResetView.as_view(), name='password-reset'),
    path('password-reset/confirm/', PasswordResetConfirmView.as_view(), name='password-reset-confirm'),
]