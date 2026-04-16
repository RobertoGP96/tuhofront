from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import OfficialDocumentViewSet, public_verify_document


router = DefaultRouter()
router.register(r'', OfficialDocumentViewSet, basename='documents')

urlpatterns = [
    path('verify/<str:code>/', public_verify_document, name='document-verify'),
] + router.urls
