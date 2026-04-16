"""
Servicios para generación de documentos PDF oficiales.

API principal:
    render_pdf(template, context) -> bytes
    generate_qr(data) -> bytes
    issue_document(resource, template, context, title, ...) -> OfficialDocument

La librería `weasyprint` es preferida (HTML -> PDF). Si falla, cae a reportlab.
"""
from __future__ import annotations

import io
import logging
from typing import Any

from django.conf import settings
from django.core.files.base import ContentFile
from django.template.loader import render_to_string

from .models import OfficialDocument

logger = logging.getLogger(__name__)


# ----------------------------------------------------------------
# QR
# ----------------------------------------------------------------

def generate_qr(data: str, box_size: int = 10, border: int = 2) -> bytes:
    """Genera un QR como PNG. Retorna bytes."""
    try:
        import qrcode
    except ImportError:  # pragma: no cover
        logger.warning('qrcode no instalado; retornando bytes vacíos')
        return b''

    qr = qrcode.QRCode(box_size=box_size, border=border)
    qr.add_data(data)
    qr.make(fit=True)
    img = qr.make_image(fill_color='black', back_color='white')
    buffer = io.BytesIO()
    img.save(buffer, format='PNG')
    return buffer.getvalue()


# ----------------------------------------------------------------
# PDF rendering
# ----------------------------------------------------------------

def render_pdf(template: str, context: dict) -> bytes:
    """Renderiza un template HTML a PDF (bytes).

    Intenta WeasyPrint primero (mejor soporte CSS), luego xhtml2pdf como fallback.
    """
    html = render_to_string(template, context)
    return _html_to_pdf(html)


def _html_to_pdf(html: str) -> bytes:
    # 1) WeasyPrint
    try:
        from weasyprint import HTML
        buf = io.BytesIO()
        HTML(string=html, base_url=str(settings.BASE_DIR)).write_pdf(target=buf)
        return buf.getvalue()
    except Exception as exc:  # noqa: BLE001
        logger.info('WeasyPrint no disponible o error (%s), intentando xhtml2pdf', exc)

    # 2) xhtml2pdf
    try:
        from xhtml2pdf import pisa
        buf = io.BytesIO()
        pisa.CreatePDF(src=html, dest=buf, encoding='utf-8')
        return buf.getvalue()
    except Exception as exc:  # noqa: BLE001
        logger.info('xhtml2pdf no disponible (%s), usando reportlab', exc)

    # 3) Fallback: reportlab (texto plano)
    return _fallback_reportlab(html)


def _fallback_reportlab(text: str) -> bytes:
    try:
        from reportlab.lib.pagesizes import A4
        from reportlab.pdfgen import canvas
    except ImportError:  # pragma: no cover
        logger.error('reportlab no instalado, no se puede generar PDF')
        return b''

    buf = io.BytesIO()
    c = canvas.Canvas(buf, pagesize=A4)
    width, height = A4
    c.setFont('Helvetica', 10)

    # Esperamos ~60 caracteres por línea; strip HTML tags brutamente
    import re
    plain = re.sub(r'<[^>]+>', '', text)
    y = height - 40
    for line in plain.splitlines():
        if not line.strip():
            y -= 12
            continue
        c.drawString(40, y, line[:90])
        y -= 14
        if y < 40:
            c.showPage()
            c.setFont('Helvetica', 10)
            y = height - 40

    c.showPage()
    c.save()
    return buf.getvalue()


# ----------------------------------------------------------------
# Issue document
# ----------------------------------------------------------------

def issue_document(
    *,
    resource: Any,
    template: str,
    context: dict,
    title: str,
    issued_by=None,
    issued_to=None,
    doc_type: str = OfficialDocument.DocType.PROCEDURE,
    expires_at=None,
    filename_prefix: str = 'documento',
) -> OfficialDocument:
    """Crea el OfficialDocument y genera el PDF.

    `resource` debe ser una instancia de modelo Django.
    El `context` se enriquece con datos institucionales y el QR de verificación.
    """
    doc = OfficialDocument.objects.create(
        resource_type=f'{resource._meta.app_label}.{resource._meta.object_name}',
        resource_id=str(resource.pk),
        title=title,
        doc_type=doc_type,
        issued_by=issued_by,
        issued_to=issued_to,
        expires_at=expires_at,
        file=ContentFile(b'', name='placeholder.pdf'),
    )

    # URL pública de verificación (frontend muestra el detalle del doc)
    frontend = getattr(settings, 'FRONTEND_URL', '').rstrip('/')
    verify_url = f'{frontend}/verify/{doc.verification_code}' if frontend else f'/verify/{doc.verification_code}'

    # Enriquecer context
    enriched = {
        **context,
        'document': doc,
        'institution_name': getattr(settings, 'INSTITUTION_NAME', 'Universidad'),
        'institution_short_name': getattr(settings, 'INSTITUTION_SHORT_NAME', 'UHo'),
        'institution_website': getattr(settings, 'INSTITUTION_WEBSITE', ''),
        'institution_address': getattr(settings, 'INSTITUTION_ADDRESS', ''),
        'verification_code': doc.verification_code,
        'verify_url': verify_url,
        'qr_png_base64': _qr_base64(verify_url),
    }

    pdf_bytes = render_pdf(template, enriched)

    filename = f'{filename_prefix}-{doc.verification_code}.pdf'
    doc.file.save(filename, ContentFile(pdf_bytes), save=True)
    return doc


def _qr_base64(data: str) -> str:
    import base64
    png = generate_qr(data)
    if not png:
        return ''
    return base64.b64encode(png).decode('ascii')
