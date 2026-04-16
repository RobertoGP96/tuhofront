"""
Endpoints de reportes y analytics para admin dashboard.

- /api/v1/reports/overview/    → KPIs agregados
- /api/v1/reports/procedures/  → stats de trámites por estado/tipo/mes
- /api/v1/reports/locals/      → ocupación por local
- /api/v1/reports/export.xlsx  → export consolidado
"""
from __future__ import annotations

from datetime import timedelta

from django.apps import apps
from django.db.models import Count
from django.http import HttpResponse
from django.utils import timezone
from rest_framework import permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response


def _get_model(app_label: str, model: str):
    try:
        return apps.get_model(app_label, model)
    except LookupError:
        return None


def _count_by_state(Model) -> dict:
    return {
        item['state']: item['total']
        for item in Model.objects.values('state').annotate(total=Count('id'))
    }


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated, permissions.IsAdminUser])
def overview(request):
    """KPIs globales."""
    User = apps.get_model('platform', 'User')
    total_users = User.objects.count()
    active_users = User.objects.filter(is_active=True).count()

    now = timezone.now()
    last_30 = now - timedelta(days=30)

    stats = {
        'users': {
            'total': total_users,
            'active': active_users,
            'new_last_30_days': User.objects.filter(date_joined__gte=last_30).count(),
        },
        'procedures': {},
        'reservations': {},
    }

    for app_label, model in [
        ('internal', 'FeedingProcedure'),
        ('internal', 'AccommodationProcedure'),
        ('internal', 'TransportProcedure'),
        ('internal', 'MaintanceProcedure'),
        ('secretary_doc', 'SecretaryDocProcedure'),
    ]:
        M = _get_model(app_label, model)
        if not M:
            continue
        stats['procedures'][model] = {
            'total': M.objects.count(),
            'last_30_days': M.objects.filter(created_at__gte=last_30).count(),
            'by_state': _count_by_state(M),
        }

    LocalReservation = _get_model('labs', 'LocalReservation')
    Local = _get_model('labs', 'Local')
    if LocalReservation:
        stats['reservations'] = {
            'total': LocalReservation.objects.count(),
            'last_30_days': LocalReservation.objects.filter(created_at__gte=last_30).count(),
            'by_state': _count_by_state(LocalReservation),
            'active_locals': Local.objects.filter(is_active=True).count() if Local else 0,
        }

    return Response(stats)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated, permissions.IsAdminUser])
def procedures_by_month(request):
    """Conteo de trámites por mes (últimos 12 meses)."""
    from django.db.models.functions import TruncMonth

    result: dict = {}
    for app_label, model in [
        ('internal', 'FeedingProcedure'),
        ('internal', 'AccommodationProcedure'),
        ('internal', 'TransportProcedure'),
        ('internal', 'MaintanceProcedure'),
        ('secretary_doc', 'SecretaryDocProcedure'),
        ('labs', 'LocalReservation'),
    ]:
        M = _get_model(app_label, model)
        if not M:
            continue
        rows = (
            M.objects.annotate(month=TruncMonth('created_at'))
            .values('month')
            .annotate(total=Count('id'))
            .order_by('month')
        )
        result[f'{app_label}.{model}'] = [
            {'month': row['month'].strftime('%Y-%m') if row['month'] else None, 'total': row['total']}
            for row in rows
        ]
    return Response(result)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated, permissions.IsAdminUser])
def local_occupancy(request):
    """Ocupación por local (conteo de reservas aprobadas/ en curso / finalizadas)."""
    Local = _get_model('labs', 'Local')
    LocalReservation = _get_model('labs', 'LocalReservation')
    if not (Local and LocalReservation):
        return Response({'detail': 'Módulo labs no disponible.'}, status=404)

    data = []
    for local in Local.objects.filter(is_active=True):
        reservations = LocalReservation.objects.filter(local=local)
        data.append({
            'local_id': str(local.pk),
            'code': local.code,
            'name': local.name,
            'capacity': local.capacity,
            'total_reservations': reservations.count(),
            'approved': reservations.filter(state='APROBADA').count(),
            'finished': reservations.filter(state='FINALIZADA').count(),
            'rejected': reservations.filter(state='RECHAZADA').count(),
        })
    return Response(data)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated, permissions.IsAdminUser])
def export_xlsx(request):
    """Exporta a XLSX todos los trámites en un archivo consolidado."""
    try:
        from openpyxl import Workbook
    except ImportError:
        try:
            import tablib
        except ImportError:
            return Response({'detail': 'No hay librerías de export disponibles.'}, status=503)
        # Fallback a tablib
        return _export_with_tablib()

    wb = Workbook()
    wb.remove(wb.active)

    for app_label, model in [
        ('internal', 'FeedingProcedure'),
        ('internal', 'AccommodationProcedure'),
        ('internal', 'TransportProcedure'),
        ('internal', 'MaintanceProcedure'),
        ('secretary_doc', 'SecretaryDocProcedure'),
        ('labs', 'LocalReservation'),
    ]:
        M = _get_model(app_label, model)
        if not M:
            continue
        ws = wb.create_sheet(title=model[:31])
        ws.append(['ID', 'Usuario', 'Estado', 'Creado', 'Observación'])
        for row in M.objects.all().select_related('user')[:5000]:
            ws.append([
                str(row.pk),
                getattr(row.user, 'username', '') if getattr(row, 'user', None) else '',
                getattr(row, 'state', ''),
                row.created_at.strftime('%Y-%m-%d %H:%M') if getattr(row, 'created_at', None) else '',
                (getattr(row, 'observation', '') or '')[:500],
            ])

    import io
    buf = io.BytesIO()
    wb.save(buf)
    response = HttpResponse(
        buf.getvalue(),
        content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    )
    response['Content-Disposition'] = 'attachment; filename="tuho-export.xlsx"'
    return response


def _export_with_tablib():
    import tablib
    dataset = tablib.Dataset(headers=['ID', 'Modelo', 'Usuario', 'Estado', 'Creado'])
    for app_label, model in [
        ('internal', 'FeedingProcedure'),
        ('internal', 'AccommodationProcedure'),
        ('internal', 'TransportProcedure'),
        ('internal', 'MaintanceProcedure'),
        ('secretary_doc', 'SecretaryDocProcedure'),
        ('labs', 'LocalReservation'),
    ]:
        M = _get_model(app_label, model)
        if not M:
            continue
        for row in M.objects.all().select_related('user')[:5000]:
            dataset.append([
                str(row.pk),
                model,
                getattr(row.user, 'username', '') if getattr(row, 'user', None) else '',
                getattr(row, 'state', ''),
                row.created_at.strftime('%Y-%m-%d %H:%M') if getattr(row, 'created_at', None) else '',
            ])
    response = HttpResponse(dataset.export('xlsx'),
                            content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    response['Content-Disposition'] = 'attachment; filename="tuho-export.xlsx"'
    return response
