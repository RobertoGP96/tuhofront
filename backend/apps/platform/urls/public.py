"""
Endpoints públicos (sin autenticación) con throttling estricto.

- GET /api/v1/public/tracking/?code=...&id_card=...  → estado de un trámite
- GET /api/v1/public/verify/<code>/                  → verifica documento oficial (redirige a app documents)
"""
from django.urls import path

from ..views.public import public_procedure_tracking


urlpatterns = [
    path('tracking/', public_procedure_tracking, name='public-procedure-tracking'),
]
