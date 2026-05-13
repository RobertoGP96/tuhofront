from django.urls import path

from ..views import reports, reports_pdf


urlpatterns = [
    # JSON existentes
    path('overview/', reports.overview, name='reports-overview'),
    path('procedures-by-month/', reports.procedures_by_month, name='reports-procedures-by-month'),
    path('local-occupancy/', reports.local_occupancy, name='reports-local-occupancy'),
    path('export.xlsx', reports.export_xlsx, name='reports-export-xlsx'),

    # PDF — un endpoint por perfil
    path('overview.pdf', reports_pdf.overview_pdf, name='reports-overview-pdf'),
    path('internal/<str:domain>.pdf', reports_pdf.internal_domain_pdf, name='reports-internal-domain-pdf'),
    path('procedures.pdf', reports_pdf.tramites_pdf, name='reports-tramites-pdf'),
    path('reservations.pdf', reports_pdf.reservations_pdf, name='reports-reservations-pdf'),
    path('secretary.pdf', reports_pdf.secretary_pdf, name='reports-secretary-pdf'),
    path('me.pdf', reports_pdf.my_history_pdf, name='reports-my-history-pdf'),
]
