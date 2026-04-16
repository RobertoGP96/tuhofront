# Operaciones — TUho

Guía operativa para despliegue, respaldo y mantenimiento del sistema TUho en producción.

---

## 1. Requisitos de producción

- **Python 3.10+**, con `venv` dedicado
- **PostgreSQL 14+** (recomendado) o SQLite para ambientes de prueba
- **Redis 6+** (requerido para Celery y eventualmente cache)
- **Nginx** como reverse proxy ante gunicorn
- **Certificado TLS** válido (Let's Encrypt)
- **Cron** o `systemd timers` para backups programados y limpieza de tokens

---

## 2. Variables de entorno (`backend/.env`)

Copia `backend/env.template` a `backend/.env` y completa como mínimo:

| Variable | Descripción |
|---|---|
| `SECRET_KEY` | Clave Django (genera con `python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"`) |
| `DEBUG` | `False` obligatorio en producción |
| `ALLOWED_HOSTS` | Dominios separados por coma |
| `DATABASE_ENGINE=django.db.backends.postgresql` | Y las credenciales DB |
| `EMAIL_HOST_USER` / `EMAIL_HOST_PASSWORD` | SMTP institucional |
| `FRONTEND_URL` | URL del frontend (para emails de activación, QR, tracking) |
| `CELERY_BROKER_URL=redis://redis:6379/0` | Necesario para emails asíncronos |
| `AXES_ENABLED=True` | Protección contra fuerza bruta |
| `SECURE_SSL_REDIRECT=True` | Obliga HTTPS |

La aplicación **rehúsa arrancar** si detecta la `SECRET_KEY` por defecto cuando `DEBUG=False`.

---

## 3. Primer despliegue

```bash
cd backend
python -m venv venv
source venv/bin/activate     # o venv\Scripts\activate en Windows
pip install -r requirements.txt

# Migraciones (incluye audit, documents, settings_runtime)
python manage.py migrate

# Estáticos
python manage.py collectstatic --no-input

# Superusuario inicial
python manage.py createsuperuser

# Validación de seguridad pre-producción
python manage.py check --deploy
```

---

## 4. Procesos a correr (Supervisor / systemd)

**Gunicorn (API)**
```
gunicorn config.wsgi:application --workers 4 --bind 127.0.0.1:8000
```

**Celery worker (emails y tareas asíncronas)**
```
celery -A config worker -l info
```

**Celery beat** (si se añaden tareas periódicas)
```
celery -A config beat -l info
```

---

## 5. Backups

### Manual
```bash
bash backend/scripts/backup.sh
```
Genera:
- Dump DB comprimido en `backend/backups/` (o `DBBACKUP_LOCATION`)
- Tarball de `media/` (uploads de usuarios)

### Programado (cron — Linux)
Editar `crontab -e`:
```
# Backup diario a las 02:30
30 2 * * * cd /srv/tuho/backend && /srv/tuho/backend/venv/bin/python manage.py dbbackup --clean --compress && /srv/tuho/backend/venv/bin/python manage.py mediabackup --clean --compress
```

### Restore
```bash
bash backend/scripts/restore.sh tuho-default-2026-04-16.psql.gz
```

### Retención recomendada
- Diarios: 7 días
- Semanales: 4 semanas
- Mensuales: 12 meses
- Copia off-site: al menos mensual (S3, servidor físicamente separado)

---

## 6. Mantenimiento periódico

| Tarea | Frecuencia | Comando |
|---|---|---|
| Purgar notificaciones expiradas | semanal | `python manage.py shell -c "from apps.notifications.models import Notificacion; Notificacion.limpiar_expiradas()"` |
| Limpiar sesiones expiradas | diario | `python manage.py clearsessions` |
| Regenerar estáticos | al desplegar | `python manage.py collectstatic --no-input` |
| Verificar integridad | semanal | `python manage.py check --deploy` |

---

## 7. Monitoreo y observabilidad

- **Health check**: `GET /api/v1/` debería retornar 401/404 (no 500)
- **Logs**: stdout/stderr capturado por supervisor/systemd (o `/var/log/tuho/`)
- **Bitácora**: accesible en admin Django → Audit → AuditLog
- **Notificaciones**: admin → Notifications → Notificaciones

Integración opcional con Sentry:
```python
# settings.py
import sentry_sdk
sentry_sdk.init(dsn=os.getenv('SENTRY_DSN'), traces_sample_rate=0.1)
```

---

## 8. Actualización de código

```bash
cd /srv/tuho
git pull
cd backend
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py collectstatic --no-input
systemctl restart tuho-gunicorn tuho-celery
```

---

## 9. Recuperación ante incidentes

1. **Caída de servicio**: `systemctl restart tuho-gunicorn` + revisar logs
2. **Base de datos corrupta**: restore desde backup más reciente (§5)
3. **Cuenta admin comprometida**: rota `SECRET_KEY` (invalida todos los JWT), desactiva cuenta en admin Django, fuerza cambio de contraseña a todos los usuarios staff
4. **Brecha de seguridad**: consulta bitácora `AuditLog` por IP/usuario; activa lockout con `AXES_FAILURE_LIMIT=1` temporalmente; notifica a la autoridad institucional

---

## 10. Contactos

- Email técnico: `${SUPPORT_EMAIL}`
- Documentación adicional: `docs/`
