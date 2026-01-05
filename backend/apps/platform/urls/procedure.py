from django.urls import path, include
from rest_framework.routers import DefaultRouter
from ..views.procedure import ProcedureViewSet

app_name = 'procedures'

router = DefaultRouter()
router.register(r'', ProcedureViewSet, basename='procedure')

urlpatterns = [
    path('', include(router.urls)),
]
