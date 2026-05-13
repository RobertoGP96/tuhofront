"""
Servicio para generación de reportes PDF branded (logo + colores institucionales).

API principal:
    render_report_pdf(template, context, user=None) -> bytes
        Renderiza un template HTML a PDF (bytes) inyectando branding + meta.

    build_bar_chart_html(labels, values, title='', color=None, max_value=None) -> str
        Genera un mini bar-chart en HTML/CSS puro (compatible con WeasyPrint).

    build_pie_chart_html(slices, title='') -> str
        Genera una pie-chart aproximada en HTML/CSS usando conic-gradient.

    pdf_response(pdf_bytes, filename) -> HttpResponse
        Helper para devolver el PDF con headers de descarga.
"""
from __future__ import annotations

import base64
import os
from datetime import datetime
from typing import Iterable

from django.conf import settings
from django.http import HttpResponse

from apps.documents.services import render_pdf


# ----------------------------------------------------------------
# Branding constants
# ----------------------------------------------------------------

BRAND_NAVY = '#243757'
BRAND_LIME = '#A3C221'
BRAND_SLATE = '#E2E8F0'
BRAND_ACCENT = '#F1F5F9'

CHART_PALETTE = [
    '#243757',  # navy
    '#A3C221',  # lime
    '#3B82F6',  # blue-500
    '#F59E0B',  # amber-500
    '#EF4444',  # red-500
    '#8B5CF6',  # violet-500
    '#10B981',  # emerald-500
    '#EC4899',  # pink-500
]


def _logo_path() -> str:
    """Ruta absoluta al logo SVG empaquetado con el backend."""
    return os.path.join(
        os.path.dirname(__file__), 'assets', 'brand', 'logo.svg'
    )


_LOGO_DATA_URI_CACHE: str | None = None


def _logo_data_uri() -> str:
    """Devuelve el logo como data URI base64 (cacheado en memoria)."""
    global _LOGO_DATA_URI_CACHE
    if _LOGO_DATA_URI_CACHE is not None:
        return _LOGO_DATA_URI_CACHE
    try:
        with open(_logo_path(), 'rb') as f:
            encoded = base64.b64encode(f.read()).decode('ascii')
        _LOGO_DATA_URI_CACHE = f'data:image/svg+xml;base64,{encoded}'
    except FileNotFoundError:
        _LOGO_DATA_URI_CACHE = ''
    return _LOGO_DATA_URI_CACHE


# ----------------------------------------------------------------
# Charts (CSS puro)
# ----------------------------------------------------------------

def build_bar_chart_html(
    labels: Iterable[str],
    values: Iterable[float | int],
    title: str = '',
    color: str | None = None,
    max_value: float | None = None,
) -> str:
    """Genera un bar-chart horizontal en HTML/CSS puro (compatible con WeasyPrint)."""
    labels = list(labels)
    values = [float(v or 0) for v in values]
    if not values:
        return f'<div class="chart-empty">{title or "Sin datos"}</div>'

    cap = max_value if max_value is not None else max(values) or 1
    bar_color = color or BRAND_NAVY

    rows = []
    for lab, val in zip(labels, values):
        pct = (val / cap * 100) if cap > 0 else 0
        rows.append(
            f'<div class="bar-row">'
            f'<span class="bar-label">{lab}</span>'
            f'<span class="bar-track"><span class="bar-fill" style="width:{pct:.1f}%;background:{bar_color};"></span></span>'
            f'<span class="bar-value">{int(val) if val == int(val) else val}</span>'
            f'</div>'
        )

    head = f'<h3 class="chart-title">{title}</h3>' if title else ''
    return f'<div class="chart">{head}<div class="bar-chart">{"".join(rows)}</div></div>'


def build_pie_chart_html(slices: list[tuple[str, float]], title: str = '') -> str:
    """Genera una pie-chart aproximada con conic-gradient.

    slices: lista de tuplas (label, value).
    """
    if not slices:
        return f'<div class="chart-empty">{title or "Sin datos"}</div>'

    total = sum(v for _, v in slices) or 1
    stops = []
    legend = []
    cursor = 0.0
    for i, (label, val) in enumerate(slices):
        color = CHART_PALETTE[i % len(CHART_PALETTE)]
        start = cursor / total * 360
        cursor += val
        end = cursor / total * 360
        stops.append(f'{color} {start:.2f}deg {end:.2f}deg')
        pct = (val / total * 100) if total else 0
        legend.append(
            f'<li><span class="legend-dot" style="background:{color};"></span>'
            f'{label} <strong>{int(val) if val == int(val) else val}</strong> ({pct:.0f}%)</li>'
        )

    head = f'<h3 class="chart-title">{title}</h3>' if title else ''
    return (
        f'<div class="chart pie-wrapper">{head}'
        f'<div class="pie" style="background:conic-gradient({", ".join(stops)});"></div>'
        f'<ul class="pie-legend">{"".join(legend)}</ul>'
        f'</div>'
    )


# ----------------------------------------------------------------
# KPI helpers
# ----------------------------------------------------------------

def kpi_card(label: str, value, sub: str | None = None) -> dict:
    return {'label': label, 'value': value, 'sub': sub or ''}


# ----------------------------------------------------------------
# Main render entry-point
# ----------------------------------------------------------------

def render_report_pdf(template: str, context: dict, user=None) -> bytes:
    """Renderiza una plantilla de reporte a PDF inyectando branding."""
    enriched = {
        **context,
        'logo_uri': _logo_data_uri(),
        'brand_navy': BRAND_NAVY,
        'brand_lime': BRAND_LIME,
        'brand_slate': BRAND_SLATE,
        'brand_accent': BRAND_ACCENT,
        'generated_at': datetime.now().strftime('%Y-%m-%d %H:%M'),
        'generated_by': (
            (getattr(user, 'get_full_name', lambda: '')() or getattr(user, 'username', ''))
            if user else ''
        ),
        'institution_name': getattr(settings, 'INSTITUTION_NAME', 'Universidad de Holguín'),
        'institution_short_name': getattr(settings, 'INSTITUTION_SHORT_NAME', 'UHo'),
    }
    return render_pdf(template, enriched)


def pdf_response(pdf_bytes: bytes, filename: str) -> HttpResponse:
    """Devuelve un PDF como adjunto descargable."""
    response = HttpResponse(pdf_bytes, content_type='application/pdf')
    response['Content-Disposition'] = f'attachment; filename="{filename}"'
    return response
