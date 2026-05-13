"""
Endpoints de reportes PDF para todos los perfiles.

Rutas (montadas bajo /api/v1/reports/):
    GET overview.pdf                   — Admin only
    GET internal/<domain>.pdf          — Admin, GESTOR_INTERNO
    GET procedures.pdf                 — Admin, GESTOR_TRAMITES
    GET reservations.pdf               — Admin, GESTOR_RESERVAS
    GET secretary.pdf                  — Admin, SECRETARIA_DOCENTE
    GET me.pdf                         — Usuario "personal" autenticado (su propio historial)

Todos aceptan: date_from, date_to (YYYY-MM-DD), state, type.
"""
from __future__ import annotations

from datetime import datetime, timedelta
from typing import Any

from django.apps import apps
from django.db.models import Count, QuerySet
from django.db.models.functions import TruncMonth
from django.utils import timezone
from rest_framework import permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

from ..report_pdf import (
    BRAND_LIME,
    BRAND_NAVY,
    build_bar_chart_html,
    build_pie_chart_html,
    kpi_card,
    pdf_response,
    render_report_pdf,
)


# ----------------------------------------------------------------
# Permission classes
# ----------------------------------------------------------------

class _HasRole(permissions.BasePermission):
    allowed_roles: tuple[str, ...] = ()

    def has_permission(self, request, view):
        u = request.user
        if not (u and u.is_authenticated):
            return False
        if u.is_staff or u.is_superuser:
            return True
        return getattr(u, 'user_type', None) in self.allowed_roles


class IsAdminOrInternalManager(_HasRole):
    allowed_roles = ('ADMIN', 'GESTOR_INTERNO')


class IsAdminOrTramitesManager(_HasRole):
    allowed_roles = ('ADMIN', 'GESTOR_TRAMITES')


class IsAdminOrReservationsManager(_HasRole):
    allowed_roles = ('ADMIN', 'GESTOR_RESERVAS')


class IsAdminOrSecretary(_HasRole):
    allowed_roles = ('ADMIN', 'SECRETARIA_DOCENTE')


_PERSONAL_USER_ROLES = ('ESTUDIANTE', 'PROFESOR', 'TRABAJADOR', 'EXTERNO', 'SECRETARIA_DOCENTE')


class IsPersonalUserOrAdmin(permissions.BasePermission):
    """Mi historial: usuarios que sí inician trámites + admin. Los gestores no aplican."""

    def has_permission(self, request, view):
        u = request.user
        if not (u and u.is_authenticated):
            return False
        if u.is_superuser or u.is_staff:
            return True
        return getattr(u, 'user_type', None) in _PERSONAL_USER_ROLES


# ----------------------------------------------------------------
# Helpers
# ----------------------------------------------------------------

INTERNAL_DOMAINS = {
    'feeding': ('internal', 'FeedingProcedure', 'Alimentación'),
    'accommodation': ('internal', 'AccommodationProcedure', 'Alojamiento'),
    'transport': ('internal', 'TransportProcedure', 'Transporte'),
    'maintenance': ('internal', 'MaintanceProcedure', 'Mantenimiento'),
}

STATE_LABELS = {
    'BORRADOR': 'Borrador',
    'ENVIADO': 'Enviado',
    'EN_PROCESO': 'En proceso',
    'REQUIERE_INFO': 'Req. info',
    'APROBADO': 'Aprobado',
    'RECHAZADO': 'Rechazado',
    'FINALIZADO': 'Finalizado',
}

TABLE_LIMIT = 200


def _get_model(app_label: str, model_name: str):
    try:
        return apps.get_model(app_label, model_name)
    except LookupError:
        return None


def _parse_date(value: str | None):
    if not value:
        return None
    try:
        return datetime.strptime(value, '%Y-%m-%d')
    except ValueError:
        return None


def _apply_common_filters(qs: QuerySet, request) -> tuple[QuerySet, list[str]]:
    """Aplica filtros comunes y devuelve (queryset, lista_de_filtros_aplicados_para_UI)."""
    filters_pills: list[str] = []
    date_from = _parse_date(request.query_params.get('date_from'))
    date_to = _parse_date(request.query_params.get('date_to'))
    state = request.query_params.get('state')

    if date_from:
        qs = qs.filter(created_at__gte=date_from)
        filters_pills.append(f'Desde {date_from.date().isoformat()}')
    if date_to:
        end = date_to + timedelta(days=1)
        qs = qs.filter(created_at__lt=end)
        filters_pills.append(f'Hasta {date_to.date().isoformat()}')
    if state:
        qs = qs.filter(state=state)
        filters_pills.append(f'Estado: {STATE_LABELS.get(state, state)}')

    return qs, filters_pills


def _state_pie(qs: QuerySet, title: str) -> str:
    rows = list(qs.values('state').annotate(total=Count('id')))
    slices = [(STATE_LABELS.get(r['state'], r['state']), r['total']) for r in rows]
    return build_pie_chart_html(slices, title=title)


def _by_month_bar(qs: QuerySet, title: str, color: str = BRAND_NAVY) -> str:
    rows = list(
        qs.annotate(month=TruncMonth('created_at'))
        .values('month')
        .annotate(total=Count('id'))
        .order_by('month')[-12:]
    )
    labels = [r['month'].strftime('%Y-%m') if r['month'] else '—' for r in rows]
    values = [r['total'] for r in rows]
    return build_bar_chart_html(labels, values, title=title, color=color)


def _safe_filename(prefix: str) -> str:
    return f'{prefix}-{datetime.now().strftime("%Y%m%d-%H%M")}.pdf'


def _state_cell(state: str) -> dict:
    """Devuelve dict reconocido por generic_report.html para renderizar como badge."""
    return {'state': state or 'BORRADOR', 'text': STATE_LABELS.get(state, state or '—')}


def _format_row_basic(item: Any) -> list:
    user = getattr(item, 'user', None)
    full = (user.get_full_name() if user and user.get_full_name() else getattr(user, 'username', '—')) if user else '—'
    return [
        getattr(item, 'get_follow_number_display', lambda: str(item.pk)[:8])(),
        full,
        _state_cell(getattr(item, 'state', '')),
        item.created_at.strftime('%Y-%m-%d %H:%M') if getattr(item, 'created_at', None) else '—',
        (getattr(item, 'observation', '') or '')[:80],
    ]


# ----------------------------------------------------------------
# 1) Admin overview PDF
# ----------------------------------------------------------------

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated, permissions.IsAdminUser])
def overview_pdf(request):
    User = apps.get_model('platform', 'User')
    now = timezone.now()
    last_30 = now - timedelta(days=30)

    kpis = [
        kpi_card('Usuarios activos', User.objects.filter(is_active=True).count(),
                 sub=f'{User.objects.filter(date_joined__gte=last_30).count()} nuevos en 30 días'),
    ]

    proc_total = 0
    by_state_global: dict[str, int] = {}
    charts: list[str] = []

    for app_label, model_name, label in [
        ('internal', 'FeedingProcedure', 'Alimentación'),
        ('internal', 'AccommodationProcedure', 'Alojamiento'),
        ('internal', 'TransportProcedure', 'Transporte'),
        ('internal', 'MaintanceProcedure', 'Mantenimiento'),
        ('secretary_doc', 'SecretaryDocProcedure', 'Secretaría'),
        ('labs', 'LocalReservation', 'Reservas'),
    ]:
        M = _get_model(app_label, model_name)
        if not M:
            continue
        qs, _pills = _apply_common_filters(M.objects.all(), request)
        proc_total += qs.count()
        for r in qs.values('state').annotate(total=Count('id')):
            by_state_global[r['state']] = by_state_global.get(r['state'], 0) + r['total']

    kpis.append(kpi_card('Trámites totales', proc_total))
    kpis.append(kpi_card('Aprobados', by_state_global.get('APROBADO', 0)))
    kpis.append(kpi_card('En proceso', by_state_global.get('EN_PROCESO', 0) + by_state_global.get('ENVIADO', 0)))

    # Pie: estados globales
    state_slices = [(STATE_LABELS.get(s, s), v) for s, v in by_state_global.items() if v]
    charts.append(build_pie_chart_html(state_slices, title='Distribución por estado'))

    # Bar: trámites por dominio
    domain_counts = []
    for app_label, model_name, label in [
        ('internal', 'FeedingProcedure', 'Alimentación'),
        ('internal', 'AccommodationProcedure', 'Alojamiento'),
        ('internal', 'TransportProcedure', 'Transporte'),
        ('internal', 'MaintanceProcedure', 'Mantenimiento'),
        ('secretary_doc', 'SecretaryDocProcedure', 'Secretaría'),
        ('labs', 'LocalReservation', 'Reservas'),
    ]:
        M = _get_model(app_label, model_name)
        if not M:
            continue
        qs, _ = _apply_common_filters(M.objects.all(), request)
        domain_counts.append((label, qs.count()))
    charts.append(build_bar_chart_html(
        [d[0] for d in domain_counts],
        [d[1] for d in domain_counts],
        title='Trámites por dominio',
        color=BRAND_LIME,
    ))

    # Tabla: top 50 trámites recientes (todos los dominios)
    rows: list[list] = []
    for app_label, model_name, label in [
        ('internal', 'FeedingProcedure', 'Alimentación'),
        ('internal', 'AccommodationProcedure', 'Alojamiento'),
        ('internal', 'TransportProcedure', 'Transporte'),
        ('internal', 'MaintanceProcedure', 'Mantenimiento'),
        ('secretary_doc', 'SecretaryDocProcedure', 'Secretaría'),
        ('labs', 'LocalReservation', 'Reservas'),
    ]:
        M = _get_model(app_label, model_name)
        if not M:
            continue
        qs, _ = _apply_common_filters(M.objects.all(), request)
        for item in qs.select_related('user').order_by('-created_at')[:30]:
            user = getattr(item, 'user', None)
            full = (user.get_full_name() if user and user.get_full_name() else getattr(user, 'username', '—')) if user else '—'
            rows.append([
                label,
                full,
                _state_cell(item.state),
                item.created_at.strftime('%Y-%m-%d') if item.created_at else '—',
            ])
    rows = sorted(rows, key=lambda r: r[3], reverse=True)[:TABLE_LIMIT]

    _, filter_pills = _apply_common_filters(_get_model('platform', 'User').objects.all(), request)

    context = {
        'report_title': 'Reporte Institucional Global',
        'active_filters': filter_pills,
        'kpis': kpis,
        'charts': charts,
        'charts_title': 'Tendencias',
        'table_title': 'Trámites recientes (todos los dominios)',
        'table_headers': ['Dominio', 'Usuario', 'Estado', 'Creado'],
        'table_rows': rows,
        'table_truncated': len(rows) >= TABLE_LIMIT,
    }
    pdf = render_report_pdf('reports/generic_report.html', context, user=request.user)
    return pdf_response(pdf, _safe_filename('reporte-global'))


# ----------------------------------------------------------------
# 2) Internal procedures PDF (per domain)
# ----------------------------------------------------------------

@api_view(['GET'])
@permission_classes([IsAdminOrInternalManager])
def internal_domain_pdf(request, domain: str):
    if domain not in INTERNAL_DOMAINS:
        return Response({'detail': 'Dominio no válido.'}, status=status.HTTP_400_BAD_REQUEST)
    app_label, model_name, label = INTERNAL_DOMAINS[domain]
    M = _get_model(app_label, model_name)
    if not M:
        return Response({'detail': 'Módulo no disponible.'}, status=status.HTTP_404_NOT_FOUND)

    qs, filter_pills = _apply_common_filters(M.objects.all(), request)

    total = qs.count()
    approved = qs.filter(state='APROBADO').count()
    in_proc = qs.filter(state__in=['ENVIADO', 'EN_PROCESO']).count()
    rejected = qs.filter(state='RECHAZADO').count()

    kpis = [
        kpi_card('Total', total),
        kpi_card('Aprobados', approved),
        kpi_card('En proceso', in_proc),
        kpi_card('Rechazados', rejected),
    ]
    charts = [
        _state_pie(qs, f'Estados — {label}'),
        _by_month_bar(qs, 'Por mes (últ. 12)', color=BRAND_LIME),
    ]
    rows = [_format_row_basic(it) for it in qs.select_related('user').order_by('-created_at')[:TABLE_LIMIT]]

    context = {
        'report_title': f'Reporte de Trámites — {label}',
        'active_filters': filter_pills,
        'kpis': kpis,
        'charts': charts,
        'table_title': 'Detalle de trámites',
        'table_headers': ['#', 'Usuario', 'Estado', 'Creado', 'Observación'],
        'table_rows': rows,
        'table_truncated': total > TABLE_LIMIT,
    }
    pdf = render_report_pdf('reports/generic_report.html', context, user=request.user)
    return pdf_response(pdf, _safe_filename(f'reporte-{domain}'))


# ----------------------------------------------------------------
# 2b) External Procedures PDF (GESTOR_TRAMITES)
# ----------------------------------------------------------------

@api_view(['GET'])
@permission_classes([IsAdminOrTramitesManager])
def tramites_pdf(request):
    """Reporte global de trámites externos (modelo platform.Procedure)."""
    M = _get_model('platform', 'Procedure')
    if not M:
        return Response({'detail': 'Módulo platform no disponible.'}, status=status.HTTP_404_NOT_FOUND)

    qs, filter_pills = _apply_common_filters(M.objects.all(), request)

    total = qs.count()
    approved = qs.filter(state='APROBADO').count()
    in_proc = qs.filter(state__in=['ENVIADO', 'EN_PROCESO']).count()
    rejected = qs.filter(state='RECHAZADO').count()

    kpis = [
        kpi_card('Total trámites', total),
        kpi_card('Aprobados', approved),
        kpi_card('En proceso', in_proc),
        kpi_card('Rechazados', rejected),
    ]
    charts = [
        _state_pie(qs, 'Estados — Trámites'),
        _by_month_bar(qs, 'Por mes (últ. 12)', color=BRAND_LIME),
    ]
    rows = [_format_row_basic(it) for it in qs.select_related('user').order_by('-created_at')[:TABLE_LIMIT]]

    context = {
        'report_title': 'Reporte de Trámites',
        'active_filters': filter_pills,
        'kpis': kpis,
        'charts': charts,
        'table_title': 'Detalle de trámites',
        'table_headers': ['#', 'Usuario', 'Estado', 'Creado', 'Observación'],
        'table_rows': rows,
        'table_truncated': total > TABLE_LIMIT,
    }
    pdf = render_report_pdf('reports/generic_report.html', context, user=request.user)
    return pdf_response(pdf, _safe_filename('reporte-tramites'))


# ----------------------------------------------------------------
# 3) Reservations PDF
# ----------------------------------------------------------------

@api_view(['GET'])
@permission_classes([IsAdminOrReservationsManager])
def reservations_pdf(request):
    LocalReservation = _get_model('labs', 'LocalReservation')
    Local = _get_model('labs', 'Local')
    if not LocalReservation:
        return Response({'detail': 'Módulo labs no disponible.'}, status=status.HTTP_404_NOT_FOUND)

    qs, filter_pills = _apply_common_filters(LocalReservation.objects.all(), request)

    total = qs.count()
    approved = qs.filter(state='APROBADO').count()
    rejected = qs.filter(state='RECHAZADO').count()
    finished = qs.filter(state='FINALIZADO').count()

    kpis = [
        kpi_card('Total reservas', total),
        kpi_card('Aprobadas', approved),
        kpi_card('Finalizadas', finished),
        kpi_card('Rechazadas', rejected),
    ]

    # Bar: por local
    local_counts = (
        qs.values('local__name').annotate(total=Count('id')).order_by('-total')[:10]
    )
    charts = [
        build_bar_chart_html(
            [lc['local__name'] or '—' for lc in local_counts],
            [lc['total'] for lc in local_counts],
            title='Top locales por reservas',
            color=BRAND_NAVY,
        ),
        _state_pie(qs, 'Estados'),
    ]

    rows = []
    for r in qs.select_related('user', 'local').order_by('-created_at')[:TABLE_LIMIT]:
        user = getattr(r, 'user', None)
        full = (user.get_full_name() if user and user.get_full_name() else getattr(user, 'username', '—')) if user else '—'
        rows.append([
            r.get_follow_number_display() if hasattr(r, 'get_follow_number_display') else str(r.pk)[:8],
            getattr(r.local, 'name', '—') if getattr(r, 'local', None) else '—',
            full,
            _state_cell(r.state),
            r.start_time.strftime('%Y-%m-%d %H:%M') if getattr(r, 'start_time', None) else '—',
        ])

    context = {
        'report_title': 'Reporte de Reservas de Locales',
        'active_filters': filter_pills,
        'kpis': kpis,
        'charts': charts,
        'table_title': 'Reservas',
        'table_headers': ['#', 'Local', 'Usuario', 'Estado', 'Inicio'],
        'table_rows': rows,
        'table_truncated': total > TABLE_LIMIT,
    }
    pdf = render_report_pdf('reports/generic_report.html', context, user=request.user)
    return pdf_response(pdf, _safe_filename('reporte-reservas'))


# ----------------------------------------------------------------
# 4) Secretary docs PDF
# ----------------------------------------------------------------

@api_view(['GET'])
@permission_classes([IsAdminOrSecretary])
def secretary_pdf(request):
    M = _get_model('secretary_doc', 'SecretaryDocProcedure')
    if not M:
        return Response({'detail': 'Módulo secretary_doc no disponible.'}, status=status.HTTP_404_NOT_FOUND)

    qs, filter_pills = _apply_common_filters(M.objects.all(), request)
    doc_type = request.query_params.get('type')
    if doc_type:
        qs = qs.filter(document_type=doc_type)
        filter_pills.append(f'Tipo: {doc_type}')

    total = qs.count()
    approved = qs.filter(state='APROBADO').count()
    in_proc = qs.filter(state__in=['ENVIADO', 'EN_PROCESO']).count()

    kpis = [
        kpi_card('Total documentos', total),
        kpi_card('Aprobados', approved),
        kpi_card('En proceso', in_proc),
    ]

    type_counts = qs.values('document_type').annotate(total=Count('id')).order_by('-total')
    charts = [
        build_pie_chart_html(
            [(r['document_type'] or '—', r['total']) for r in type_counts],
            title='Por tipo de documento',
        ),
        _state_pie(qs, 'Estados'),
    ]

    rows = [_format_row_basic(it) for it in qs.select_related('user').order_by('-created_at')[:TABLE_LIMIT]]

    context = {
        'report_title': 'Reporte de Secretaría Docente',
        'active_filters': filter_pills,
        'kpis': kpis,
        'charts': charts,
        'table_title': 'Documentos',
        'table_headers': ['#', 'Usuario', 'Estado', 'Creado', 'Observación'],
        'table_rows': rows,
        'table_truncated': total > TABLE_LIMIT,
    }
    pdf = render_report_pdf('reports/generic_report.html', context, user=request.user)
    return pdf_response(pdf, _safe_filename('reporte-secretaria'))


# ----------------------------------------------------------------
# 5) My history PDF (any authenticated user)
# ----------------------------------------------------------------

@api_view(['GET'])
@permission_classes([IsPersonalUserOrAdmin])
def my_history_pdf(request):
    user = request.user
    all_qs = []
    filter_pills: list[str] = []

    for app_label, model_name, label in [
        ('internal', 'FeedingProcedure', 'Alimentación'),
        ('internal', 'AccommodationProcedure', 'Alojamiento'),
        ('internal', 'TransportProcedure', 'Transporte'),
        ('internal', 'MaintanceProcedure', 'Mantenimiento'),
        ('secretary_doc', 'SecretaryDocProcedure', 'Secretaría'),
        ('labs', 'LocalReservation', 'Reservas'),
    ]:
        M = _get_model(app_label, model_name)
        if not M:
            continue
        qs = M.objects.filter(user=user)
        qs, pills = _apply_common_filters(qs, request)
        if not filter_pills:
            filter_pills = pills
        all_qs.append((label, qs))

    total = sum(q.count() for _, q in all_qs)
    approved = sum(q.filter(state='APROBADO').count() for _, q in all_qs)
    in_proc = sum(q.filter(state__in=['ENVIADO', 'EN_PROCESO']).count() for _, q in all_qs)

    kpis = [
        kpi_card('Total trámites', total),
        kpi_card('Aprobados', approved),
        kpi_card('En proceso', in_proc),
    ]

    # Bar: por dominio
    charts = [
        build_bar_chart_html(
            [label for label, q in all_qs],
            [q.count() for _, q in all_qs],
            title='Trámites por dominio',
            color=BRAND_NAVY,
        ),
    ]
    # Pie: estados consolidados
    state_acc: dict[str, int] = {}
    for _, q in all_qs:
        for r in q.values('state').annotate(total=Count('id')):
            state_acc[r['state']] = state_acc.get(r['state'], 0) + r['total']
    if state_acc:
        charts.append(build_pie_chart_html(
            [(STATE_LABELS.get(s, s), v) for s, v in state_acc.items() if v],
            title='Por estado',
        ))

    rows: list[list] = []
    for label, q in all_qs:
        for it in q.order_by('-created_at')[:50]:
            rows.append([
                label,
                it.get_follow_number_display() if hasattr(it, 'get_follow_number_display') else str(it.pk)[:8],
                _state_cell(it.state),
                it.created_at.strftime('%Y-%m-%d') if it.created_at else '—',
                (getattr(it, 'observation', '') or '')[:60],
            ])
    rows = sorted(rows, key=lambda r: r[3], reverse=True)[:TABLE_LIMIT]

    full_name = user.get_full_name() or user.username
    context = {
        'report_title': 'Mi Historial',
        'active_filters': filter_pills + [f'Usuario: {full_name}'],
        'kpis': kpis,
        'charts': charts,
        'table_title': 'Mis trámites',
        'table_headers': ['Dominio', '#', 'Estado', 'Creado', 'Observación'],
        'table_rows': rows,
        'table_truncated': total > TABLE_LIMIT,
        'empty_message': 'No tienes trámites registrados en el periodo seleccionado.',
    }
    pdf = render_report_pdf('reports/generic_report.html', context, user=user)
    return pdf_response(pdf, _safe_filename('mi-historial'))
