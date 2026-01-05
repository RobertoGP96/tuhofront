from django.urls import path, include
from rest_framework.routers import DefaultRouter
from ..views.news import NewsViewSet

# Router específico para News
router = DefaultRouter()
router.register(r'', NewsViewSet, basename='news')

urlpatterns = [
    path('', include(router.urls)),
]
