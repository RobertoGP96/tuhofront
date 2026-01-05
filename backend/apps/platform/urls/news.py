from django.urls import path, include
from rest_framework.routers import DefaultRouter

# Router específico para News
router = DefaultRouter()
# router.register(r'news', NewsViewSet, basename='news')

urlpatterns = [
    path('', include(router.urls)),
]
