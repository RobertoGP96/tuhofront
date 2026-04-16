from django.urls import path

from ..views import reports


urlpatterns = [
    path('overview/', reports.overview, name='reports-overview'),
    path('procedures-by-month/', reports.procedures_by_month, name='reports-procedures-by-month'),
    path('local-occupancy/', reports.local_occupancy, name='reports-local-occupancy'),
    path('export.xlsx', reports.export_xlsx, name='reports-export-xlsx'),
]
