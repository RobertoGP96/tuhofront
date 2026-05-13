"""
Endpoints públicos (sin autenticación) con throttling estricto.

- GET  /api/v1/public/tracking/?code=...&id_card=...  → estado de un trámite
- POST /api/v1/public/contact/                        → envía mensaje de contacto
- GET  /api/v1/public/verify/<code>/                  → verifica documento oficial (app documents)
"""
from django.urls import path

from ..views.public import public_procedure_tracking, public_contact


urlpatterns = [
    path('tracking/', public_procedure_tracking, name='public-procedure-tracking'),
    path('contact/', public_contact, name='public-contact'),
]
