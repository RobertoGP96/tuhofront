# Resumen de Implementación — Ola 1 + Ola 2

## Estado: Ola 1 (crítica) y Ola 2 (completitud) implementadas

Archivo de plan: [`C:\Users\PC\.claude\plans\hazy-prancing-sparkle.md`](../.claude/plans/hazy-prancing-sparkle.md).

---

## Backend

### Ola 1.1 — Hardening de configuración
- **[backend/config/settings.py](../backend/config/settings.py)** reescrito:
  - Validación dura de `SECRET_KEY` en producción (rehúsa arrancar con la key insegura si `DEBUG=False`).
  - Security headers: `SECURE_*`, HSTS, cookies seguras en producción.
  - `AUTHENTICATION_BACKENDS` con `AxesStandaloneBackend`.
  - Celery, dbbackup, axes, throttling configurados.
  - Límites de upload y lista de MIME permitidos.
- **[backend/env.template](../backend/env.template)** ampliado con todas las variables nuevas.
- **[backend/requirements.txt](../backend/requirements.txt)** con versiones nuevas: weasyprint, celery, redis, django-axes, django-ratelimit, qrcode, python-magic, django-dbbackup, icalendar, openpyxl.

### Ola 1.2 — Rate limiting + brute force
- `django-axes` instalado y configurado (5 intentos / 15min por IP+username).
- `ScopedRateThrottle` en DRF con scopes: `login`, `register`, `password_reset`, `public_tracking`.
- `axes_lockout_response` personalizada en [backend/apps/platform/views/auth.py](../backend/apps/platform/views/auth.py).

### Ola 1.3 — Activación + recuperación de contraseña
- [backend/apps/platform/views/user.py](../backend/apps/platform/views/user.py) reescrita:
  - Al registrarse: se desactiva la cuenta hasta verificar email.
  - Email de activación (template [backend/templates/emails/account_activation.html](../backend/templates/emails/account_activation.html)) con token.
  - `PasswordResetView` y `PasswordResetConfirmView` envían email real ([backend/templates/emails/password_reset.html](../backend/templates/emails/password_reset.html)).
  - `resend_activation` endpoint público con throttling.

### Ola 1.4 — Generación de PDF oficial
- **Nueva app `apps/documents`** con:
  - Modelo `OfficialDocument` con `verification_code` único y `revoked` flag.
  - [backend/apps/documents/services.py](../backend/apps/documents/services.py): `render_pdf()` (WeasyPrint → xhtml2pdf → reportlab), `generate_qr()`, `issue_document()`.
  - Templates: [base.html](../backend/apps/documents/templates/documents/base.html), [procedure_generic.html](../backend/apps/documents/templates/documents/procedure_generic.html), [reservation.html](../backend/apps/documents/templates/documents/reservation.html) — con encabezado institucional, watermark, firma y QR de verificación.
  - Endpoints: `POST /api/v1/documents/issue/reservation/{id}/`, `POST /api/v1/documents/issue/procedure/{app}/{model}/{id}/`.
  - Endpoint público: `GET /api/v1/documents/verify/{code}/`.

### Ola 1.5 — Notificaciones unificadas
- [backend/apps/notifications/services.py](../backend/apps/notifications/services.py) reescrito con `notify()`, `notify_many()`, `notify_state_change()`.
- [backend/apps/notifications/tasks.py](../backend/apps/notifications/tasks.py) con `send_email_task` (Celery `@shared_task`).
- Signals en [backend/apps/internal/signals.py](../backend/apps/internal/signals.py) y [backend/apps/labs/signals.py](../backend/apps/labs/signals.py) dispa­ran notificaciones + audit log al cambiar estado.
- Templates de email: [state_change.html](../backend/templates/emails/state_change.html).

### Ola 1.6 — Audit log centralizado
- **Nueva app `apps/audit`** con:
  - Modelo `AuditLog(user, action, resource_type, resource_id, metadata, ip, user_agent, created_at)`.
  - [backend/apps/audit/middleware.py](../backend/apps/audit/middleware.py) `AuditContextMiddleware` captura request context.
  - [backend/apps/audit/services.py](../backend/apps/audit/services.py) `log_event()` API global.
  - [backend/apps/audit/signals.py](../backend/apps/audit/signals.py) registra login/logout/login_failed.
  - `GET /api/v1/audit/logs/` (solo admin) y `GET /api/v1/audit/logs/resource/{app}/{model}/{id}/` (dueño o admin).

### Ola 1.7 — Backups y documentación
- [backend/scripts/backup.sh](../backend/scripts/backup.sh) y [restore.sh](../backend/scripts/restore.sh).
- `django-dbbackup` configurado con storage filesystem.
- [docs/OPERATIONS.md](OPERATIONS.md) con guía completa de producción.

### Ola 2.1 — Motivo de rechazo + historial
- Validación en signals: rechazar un trámite interno exige `observation` no vacía.
- Endpoint `resource_history` filtra audit log para dueño del recurso o staff.

### Ola 2.2 — Tracking público
- [backend/apps/platform/views/public.py](../backend/apps/platform/views/public.py) `public_procedure_tracking` busca en todas las apps de trámites por `numero_seguimiento` + `id_card`.
- Endpoint: `GET /api/v1/public/tracking/?code=...&id_card=...` (sin auth, throttled).

### Ola 2.3 — Reservas extendidas
- [backend/apps/labs/models_extensions.py](../backend/apps/labs/models_extensions.py) añade:
  - `Equipment` + `LocalEquipment` (inventario por local)
  - `ReservationEquipmentRequest`
  - `ReservationSeries` (recurrencia DAILY/WEEKLY/MONTHLY con expansión)
  - `ReservationCheckIn`
- [backend/apps/labs/views_extensions.py](../backend/apps/labs/views_extensions.py): ViewSets + endpoint `reservation_ical` (.ics export) + `check-in`/`check-out`.

### Ola 2.4 — Reportes
- [backend/apps/platform/views/reports.py](../backend/apps/platform/views/reports.py):
  - `GET /api/v1/reports/overview/` — KPIs globales
  - `GET /api/v1/reports/procedures-by-month/` — tendencia mensual
  - `GET /api/v1/reports/local-occupancy/` — ocupación por local
  - `GET /api/v1/reports/export.xlsx` — export consolidado

### Ola 2.6 — Configuración runtime
- **Nueva app `apps/settings_runtime`** con `SystemSettings` singleton (cacheado).
- `GET /api/v1/settings/public/` (sin auth, para bootstrap del frontend).
- `GET|PATCH /api/v1/settings/` (admin).

### Ola 2.7 — Validación de uploads
- [backend/apps/platform/utils/file_validation.py](../backend/apps/platform/utils/file_validation.py):
  - `validate_uploaded_file()` verifica MIME real con `python-magic` (fallback por extensión).
  - `AllowedMimeValidator` como validator reusable en FileField.

---

## Frontend

### Servicios nuevos
- [client/src/services/audit.service.ts](../client/src/services/audit.service.ts)
- [client/src/services/documents.service.ts](../client/src/services/documents.service.ts)
- [client/src/services/reports.service.ts](../client/src/services/reports.service.ts)
- [client/src/services/settings.service.ts](../client/src/services/settings.service.ts)
- [client/src/services/public.service.ts](../client/src/services/public.service.ts)
- [client/src/services/labs-extensions.service.ts](../client/src/services/labs-extensions.service.ts)

### Páginas y componentes nuevos
- [client/src/pages/Tracking.tsx](../client/src/pages/Tracking.tsx) — consulta pública por código + CI.
- [client/src/pages/VerifyDocument.tsx](../client/src/pages/VerifyDocument.tsx) — verificación de QR de documento.
- [client/src/pages/Activate.tsx](../client/src/pages/Activate.tsx) — activación por token.
- [client/src/components/NotificationBell.tsx](../client/src/components/NotificationBell.tsx) — campanita con polling.
- [client/src/components/ResourceHistory.tsx](../client/src/components/ResourceHistory.tsx) — timeline de audit log de un recurso.

### Rutas registradas en [App.tsx](../client/src/App.tsx)
- `/tracking`, `/verify`, `/verify/:code`, `/activate`.

---

## Pendiente (Ola 3 / siguientes sprints)

- **2FA** (TOTP) con `django-otp`
- **Firma digital** criptográfica (hash SHA-256 + sello de tiempo)
- **SSO institucional** (SAML/LDAP)
- **Testing**: pytest-django con coverage ≥70%, Vitest frontend, Playwright E2E, GitHub Actions
- **i18n frontend** (react-i18next)
- **Accesibilidad**: auditoría axe-core y correcciones WCAG 2.1 AA
- **WebSockets** para notificaciones en tiempo real
- **SMS** (OTP + alertas urgentes)
- **Integración SIS** (sistema académico) y pasarela de pago (si aplica)

---

## Verificación rápida

```bash
cd backend
./venv/Scripts/activate   # Windows
pip install -r requirements.txt
python manage.py migrate
python manage.py check --deploy   # advertencias solo de drf-spectacular

# Smoke test
DJANGO_SETTINGS_MODULE=config.settings python -c "
import django; django.setup()
from apps.documents.services import generate_qr
from apps.settings_runtime.models import SystemSettings
print('Settings:', SystemSettings.load().institution_name)
print('QR bytes:', len(generate_qr('TEST')))
"
```

Frontend:
```bash
cd client
pnpm install  # o npm i
npx tsc --noEmit   # debe pasar sin errores
pnpm dev
```

## Rutas nuevas disponibles

### Públicas (sin auth)
- `GET /api/v1/public/tracking/?code=...&id_card=...`
- `GET /api/v1/documents/verify/{code}/`
- `GET /api/v1/settings/public/`

### Autenticadas
- `GET /api/v1/notificaciones/` (existente, ahora se alimenta por signals)
- `POST /api/v1/documents/issue/reservation/{id}/`
- `POST /api/v1/documents/issue/procedure/{app}/{model}/{id}/`
- `GET /api/v1/documents/` (documentos del usuario)
- `GET /api/v1/audit/logs/resource/{app}/{model}/{id}/` (dueño o admin)
- `POST /api/v1/labs/checkin/check-in/{id}/`
- `POST /api/v1/labs/checkin/check-out/{id}/`
- `GET /api/v1/labs/reservations/{id}/ical/`
- `POST /api/v1/labs/series/` y `POST /api/v1/labs/series/{id}/expand/`
- `GET /api/v1/labs/equipment/`, `/api/v1/labs/local-equipment/?local=...`

### Solo admin
- `GET /api/v1/audit/logs/`
- `GET|PATCH /api/v1/settings/`
- `GET /api/v1/reports/overview/`
- `GET /api/v1/reports/procedures-by-month/`
- `GET /api/v1/reports/local-occupancy/`
- `GET /api/v1/reports/export.xlsx`
