"""
Tareas Celery para generación asíncrona de documentos oficiales.

El endpoint sincrónico (``OfficialDocumentViewSet.issue_*``) sigue funcionando
para no romper el frontend. Estas tareas son utilizadas por:

- Operaciones bulk (aprobar N reservas → emitir N PDFs sin bloquear).
- Re-generación de PDFs revocados/dañados.
- Futuro endpoint ``POST /issue/...?async=true`` cuando el frontend soporte polling.

Si Celery no está disponible o ``CELERY_TASK_ALWAYS_EAGER=True``, se ejecuta
sincrónicamente (entorno de desarrollo).
"""
from __future__ import annotations

import logging

from django.core.files.base import ContentFile

logger = logging.getLogger(__name__)


try:
    from celery import shared_task
except ImportError:  # pragma: no cover
    def shared_task(*args, **kwargs):  # type: ignore[misc]
        def decorator(fn):
            fn.delay = lambda *a, **kw: fn(*a, **kw)
            return fn
        return decorator


@shared_task(
    bind=True,
    autoretry_for=(Exception,),
    retry_backoff=True,
    retry_kwargs={'max_retries': 3},
    name='documents.regenerate_pdf',
)
def regenerate_document_pdf(self, document_id: str) -> str:
    """Regenera el archivo PDF de un OfficialDocument existente.

    Útil cuando se modifica la plantilla y se quieren refrescar documentos
    previamente emitidos, o cuando un PDF se generó corrupto.

    Args:
        document_id: UUID del OfficialDocument.

    Returns:
        El verification_code del documento regenerado.
    """
    from .models import OfficialDocument
    from .services import render_pdf, _qr_base64
    from django.apps import apps
    from django.conf import settings

    doc = OfficialDocument.objects.select_related('issued_by', 'issued_to').get(pk=document_id)

    # Cargar el recurso original
    try:
        app_label, model_name = doc.resource_type.split('.', 1)
        Model = apps.get_model(app_label, model_name)
        resource = Model.objects.get(pk=doc.resource_id)
    except Exception:
        logger.exception('No se pudo cargar el recurso original del documento %s', document_id)
        raise

    # Determinar template + context según tipo
    template_map = {
        OfficialDocument.DocType.RESERVATION: 'documents/reservation.html',
        OfficialDocument.DocType.PROCEDURE: 'documents/procedure_generic.html',
    }
    template = template_map.get(doc.doc_type, 'documents/procedure_generic.html')

    frontend = getattr(settings, 'FRONTEND_URL', '').rstrip('/')
    verify_url = f'{frontend}/verify/{doc.verification_code}' if frontend else f'/verify/{doc.verification_code}'

    user = getattr(resource, 'user', None) or doc.issued_to
    context = {
        'document': doc,
        'reservation': resource if doc.doc_type == OfficialDocument.DocType.RESERVATION else None,
        'procedure': resource if doc.doc_type == OfficialDocument.DocType.PROCEDURE else None,
        'user': user,
        'user_full_name': user.get_full_name() if user else '',
        'institution_name': getattr(settings, 'INSTITUTION_NAME', 'Universidad'),
        'institution_short_name': getattr(settings, 'INSTITUTION_SHORT_NAME', 'UHo'),
        'institution_website': getattr(settings, 'INSTITUTION_WEBSITE', ''),
        'institution_address': getattr(settings, 'INSTITUTION_ADDRESS', ''),
        'verification_code': doc.verification_code,
        'verify_url': verify_url,
        'qr_png_base64': _qr_base64(verify_url),
    }

    pdf_bytes = render_pdf(template, context)
    filename = f'documento-{doc.verification_code}.pdf'
    doc.file.save(filename, ContentFile(pdf_bytes), save=True)

    logger.info('PDF regenerado para documento %s (código %s)', document_id, doc.verification_code)
    return doc.verification_code


@shared_task(
    bind=True,
    autoretry_for=(Exception,),
    retry_backoff=True,
    retry_kwargs={'max_retries': 3},
    name='documents.issue_for_resource',
)
def issue_document_for_resource_async(
    self,
    resource_app_label: str,
    resource_model: str,
    resource_pk: str,
    *,
    template: str,
    title: str,
    doc_type: str,
    issued_by_id: int | None = None,
    issued_to_id: int | None = None,
    filename_prefix: str = 'documento',
) -> str:
    """Emite un documento oficial de forma asíncrona.

    Pensado para casos de uso bulk (p.ej. aprobar 50 reservas → emitir 50 PDFs
    sin bloquear el request del aprobador). Para el camino sincrónico (UI
    interactiva), seguí usando ``services.issue_document`` directamente.

    Returns:
        El UUID del OfficialDocument emitido.
    """
    from django.apps import apps
    from django.contrib.auth import get_user_model
    from .services import issue_document

    Model = apps.get_model(resource_app_label, resource_model)
    resource = Model.objects.get(pk=resource_pk)

    User = get_user_model()
    issued_by = User.objects.filter(pk=issued_by_id).first() if issued_by_id else None
    issued_to = User.objects.filter(pk=issued_to_id).first() if issued_to_id else None

    doc = issue_document(
        resource=resource,
        template=template,
        context={'resource': resource},
        title=title,
        issued_by=issued_by,
        issued_to=issued_to,
        doc_type=doc_type,
        filename_prefix=filename_prefix,
    )

    logger.info('Documento emitido asíncrono: %s para %s.%s id=%s',
                doc.pk, resource_app_label, resource_model, resource_pk)
    return str(doc.pk)
