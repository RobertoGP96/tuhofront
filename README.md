# TUho — Sistema Integral de Gestión Universitaria

Plataforma full-stack para la Universidad de Holguín que centraliza trámites internos, reservas de locales, secretaría docente, generación de documentos oficiales con QR de verificación, notificaciones y auditoría.

- **Backend**: Django 5 + Django REST Framework + SimpleJWT (`backend/`).
- **Frontend**: React 19 + TypeScript + Vite + React Query + PrimeReact + Tailwind (`client/`).

---

## 📁 Estructura

```
tuhofront/
├── backend/          # API Django (apps: platform, internal, labs, secretary_doc,
│                     #   documents, notifications, audit, settings_runtime)
├── client/           # Aplicación React + Vite
├── docs/             # Documentación adicional (operaciones, implementación, ola2)
└── README.md
```

---

## ✅ Prerrequisitos

| Herramienta | Versión recomendada | Notas |
|---|---|---|
| Python | 3.10+ (probado en 3.12) | Necesario para el backend |
| Node.js | 18+ | Necesario para el frontend |
| pnpm | 8+ | Gestor de paquetes preferido (`npm i -g pnpm`) |
| Git | cualquiera reciente | Para clonar |
| PostgreSQL | 14+ (opcional) | SQLite se usa por defecto en desarrollo |
| Redis | 6+ (opcional) | Solo si querés ejecutar Celery con worker real |
| GTK3 Runtime | 3.24+ (Windows) | **Necesario** para generar PDFs estilizados con WeasyPrint. Sin él los reportes salen en texto plano. Ver sección [Generación de PDFs](#-generación-de-pdfs-weasyprint). |

> **Windows**: las instrucciones funcionan en `Git Bash`, `PowerShell` y `cmd`. Donde el comando difiera entre OS se indica explícitamente.

---

## 🚀 Instalación rápida (5 minutos, todo local)

### 1. Clonar y entrar al repo

```bash
git clone <url-del-repo> tuhofront
cd tuhofront
```

### 2. Backend

```bash
cd backend

# Crear y activar entorno virtual
python -m venv venv
# Windows:
venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

# Instalar dependencias
pip install -r requirements.txt

# Configurar variables de entorno
cp env.template .env             # Linux/macOS
# copy env.template .env         # Windows cmd

# Generar SECRET_KEY y reemplazarla en .env
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
# → Copiá el valor impreso en la línea SECRET_KEY=... de backend/.env

# Aplicar migraciones (crea backend/db.sqlite3 si no existe)
python manage.py migrate

# Cargar datos de prueba (usuarios, departamentos, locales, trámites, noticias)
python manage.py seed_demo

# Arrancar el servidor
python manage.py runserver
```

El backend queda en **http://localhost:8000**.
La documentación interactiva de la API (Swagger) está en **http://localhost:8000/api/docs/**.

### 3. Frontend (en otra terminal)

```bash
cd client

# Instalar dependencias
pnpm install        # o: npm install

# Configurar URL del backend (opcional — hay default)
cp .env.example .env

# Arrancar el dev server
pnpm dev            # o: npm run dev
```

El frontend queda en **http://localhost:5173**.

### 4. ¡Listo! Iniciá sesión

Usá cualquiera de las credenciales sembradas (ver tabla más abajo). Por ejemplo:

- Usuario: `admin`
- Contraseña: `Admin12345`

---

## 👥 Usuarios de prueba (cargados por `seed_demo`)

Todos los usuarios están activos, con email verificado y listos para usar.

| Usuario | Contraseña | Rol (`user_type`) | Para qué sirve |
|---|---|---|---|
| `admin` | `Admin12345` | ADMIN (superuser) | Panel `/admin`, ver todos los trámites, aprobar, exportar reportes, gestionar usuarios y configuración |
| `gestor_int` | `Demo12345` | GESTOR_INTERNO | Panel `/gestor-interno`, gestionar trámites internos (alimentación, alojamiento, transporte, mantenimiento) |
| `gestor_sec` | `Demo12345` | GESTOR_SECRETARIA | Panel `/secretary` y `/gestor-secretaria`, gestionar trámites de Secretaría Docente |
| `gestor_res` | `Demo12345` | GESTOR_RESERVAS | Panel `/gestor-reservas`, aprobar/rechazar reservas de locales |
| `usuario` | `Demo12345` | USUARIO | Solicitante final: crear sus propios trámites y reservas |
| `usuario.amaya` … `usuario.pedro` | `Demo12345` | USUARIO | Variantes adicionales para listados con volumen |

### Datos sembrados además de los usuarios

| Recurso | Cantidad / contenido |
|---|---|
| Departamentos | 3 (Demo Facultad de Informática, Demo Facultad de Ingeniería, Demo Vicerrectoría Administrativa) |
| Áreas | 6 (2 por departamento) |
| Noticias publicadas | 3 noticias de demo, 1 destacada |
| Locales | 5 (`LAB-01`, `LAB-02`, `AULA-101`, `AUDI-A`, `SALA-R1`) |
| Reservas | 1 pendiente (LAB-01) y 1 aprobada (AUDI-A) — creadas por `profesor` |
| Catálogos internos | 3 tipos de transporte, 4 tipos de mantenimiento, 4 prioridades |
| Trámites internos | 1 de cada tipo (alimentación, alojamiento, transporte, mantenimiento) |

### Recargar / resetear el seed

```bash
# Vuelve a cargar (idempotente, no duplica)
python manage.py seed_demo

# Borra los datos de demo (usuarios, departamentos con prefijo "Demo ", noticias "demo-*") y vuelve a cargarlos
python manage.py seed_demo --reset
```

> El comando es **seguro**: no toca datos que no fueron creados por el seed (salvo con `--reset`).

---

## 🧪 Verificar que todo funciona

Con backend y frontend corriendo, probá estos flujos en orden:

1. **Login**: abrí http://localhost:5173/login, ingresá con `admin` / `Admin12345`. Deberías quedar en el dashboard de admin.
2. **API directa**: abrí http://localhost:8000/api/docs/, expandí `POST /auth/login/`, hacé `Try it out` con `{"username":"admin","password":"Admin12345"}` → debería responder 200 con `access` y `refresh`.
3. **Noticias públicas**: navegá a http://localhost:5173/news sin login — deberías ver las 3 noticias sembradas.
4. **Reservas**: con `profesor` ingresado, andá a `/locals` y mirá los locales. Después `/locals/my-reservations` muestra las 2 reservas sembradas.
5. **Trámite de mantenimiento**: con `trabajador` ingresado, abrí `/procedures/internal/maintenance` y verificá que los selectores de "Tipo" y "Prioridad" se llenan.
6. **Tracking público**: en `/tracking` ingresá el número de seguimiento de alguna reserva más el carnet del solicitante.
7. **Reportes**: con `admin`, en `/admin/` deberías ver estadísticas con datos reales.

---

## ⚙️ Variables de entorno

### Backend (`backend/.env`)

Las mínimas para correr en local están en `backend/env.template`. Las más importantes:

| Variable | Default | Notas |
|---|---|---|
| `SECRET_KEY` | (obligatoria) | Generala con `python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"` |
| `DEBUG` | `True` | En producción ponela en `False` |
| `ALLOWED_HOSTS` | `*` (solo DEBUG) | **Producción**: lista explícita de dominios. El backend rechaza arrancar con `DEBUG=False` y `ALLOWED_HOSTS='*'`. |
| `FRONTEND_URL` | `http://localhost:5173` | Usada en emails de activación |
| `DATABASE_*` | (sin definir → SQLite) | **Producción**: PostgreSQL **obligatorio**. SQLite no soporta la concurrencia esperada. Definí `DATABASE_ENGINE=django.db.backends.postgresql` + el resto. |
| `EMAIL_*` | smtp.gmail.com | Configurá si querés probar registro/activación con correo real |
| `CELERY_TASK_ALWAYS_EAGER` | `True` (DEBUG) | En producción ponelo en `False` y corré workers de Celery + Redis para tareas asíncronas. |
| `CORS_ALLOW_ALL_ORIGINS` | `True` (DEBUG) | Producción: usar `CORS_ALLOWED_ORIGINS` con la lista explícita del frontend. |
| `SECURE_SSL_REDIRECT` | `True` (no-DEBUG) | Forza HTTPS. Asegurate de tener TLS válido detrás del proxy. |
| `SENTRY_DSN` | (vacío) | Si configurado, los errores no manejados se reportan a Sentry. |

El archivo `backend/env.template` documenta **todas** las variables con comentarios.

> ⚠️ **Checklist mínimo de producción** (correr antes del primer deploy):
>
> 1. `SECRET_KEY` propio (generado, no el de desarrollo).
> 2. `DEBUG=False`.
> 3. `ALLOWED_HOSTS` con dominios reales (no `*`).
> 4. `DATABASE_ENGINE=django.db.backends.postgresql` con credenciales reales.
> 5. `CELERY_TASK_ALWAYS_EAGER=False` + worker Celery + Redis corriendo.
> 6. `EMAIL_*` apuntando al SMTP institucional, no a Gmail demo.
> 7. `CORS_ALLOWED_ORIGINS` restringido al dominio del frontend.
> 8. `python manage.py check --deploy` debe pasar sin warnings.
> 9. `python manage.py collectstatic --no-input` ejecutado.
> 10. Endpoint `GET /api/v1/health/` responde 200 (load balancer probe).

### Frontend (`client/.env`)

| Variable | Default | Notas |
|---|---|---|
| `VITE_API_URL` | `http://localhost:8000/api/v1` | Apuntá al backend. Debe terminar con `/api/v1` |
| `VITE_CONTACT_EMAIL` | `atencion@uho.edu.cu` | Email al que apunta el `mailto:` del formulario de contacto |

---

## 🛠️ Stack técnico

### Frontend
- React 19 · TypeScript 5.8 · Vite 6
- React Router 7 · React Query 5
- PrimeReact 10 · TailwindCSS 4 · shadcn/ui (radix-ui)
- Axios con interceptores de JWT + refresh automático

### Backend
- Django 5 · Django REST Framework 3.15
- djangorestframework-simplejwt (JWT)
- drf-spectacular (OpenAPI / Swagger)
- django-axes (brute-force protection)
- Celery + Redis (emails asíncronos)
- WeasyPrint / reportlab + qrcode (documentos oficiales con QR)
- PostgreSQL / SQLite

---

## 📜 Scripts útiles

### Backend (`cd backend && source venv/bin/activate`)

```bash
python manage.py runserver         # dev server
python manage.py migrate           # aplicar migraciones
python manage.py makemigrations    # generar migraciones a partir de cambios en modelos
python manage.py createsuperuser   # superusuario interactivo (alternativa al seed)
python manage.py seed_demo         # cargar/actualizar datos de prueba (idempotente)
python manage.py seed_demo --reset # resetear los datos de prueba y volver a cargar
python manage.py collectstatic     # archivos estáticos (producción)
python manage.py check --deploy    # checklist de seguridad para producción
```

### Frontend (`cd client`)

```bash
pnpm dev        # dev server con HMR
pnpm build      # build de producción (tsc + vite build)
pnpm preview    # servir el build localmente
pnpm lint       # ESLint
```

---

## 🐳 (Opcional) PostgreSQL en lugar de SQLite

1. Instalar PostgreSQL y crear base + usuario:
   ```sql
   CREATE DATABASE tuho_db;
   CREATE USER tuho_user WITH PASSWORD 'tuho_password';
   GRANT ALL PRIVILEGES ON DATABASE tuho_db TO tuho_user;
   ```
2. Descomentar y completar en `backend/.env`:
   ```env
   DATABASE_ENGINE=django.db.backends.postgresql
   DATABASE_NAME=tuho_db
   DATABASE_USER=tuho_user
   DATABASE_PASSWORD=tuho_password
   DATABASE_HOST=localhost
   DATABASE_PORT=5432
   ```
3. Volver a correr `python manage.py migrate` y `python manage.py seed_demo`.

---

## 🖨️ Generación de PDFs (WeasyPrint)

Los reportes (`/api/v1/reports/*.pdf`) y documentos oficiales se renderizan con **WeasyPrint** desde plantillas HTML/CSS (logo institucional, KPIs, tablas con badges de estado, charts). WeasyPrint depende de librerías nativas (**GLib/Pango/Cairo/HarfBuzz**) que **no vienen con Python en Windows**. Si faltan, el sistema cae a un fallback de **texto plano** que es legible pero no respeta el branding.

### Windows

1. Descargar el instalador de [GTK3 Runtime Environment for Windows](https://github.com/tschoonj/GTK-for-Windows-Runtime-Environment-Installer/releases) (archivo `gtk3-runtime-3.24.x-win64.exe`, ~30 MB).
2. Durante la instalación marcar **"Set up PATH environment variable to include GTK+"**. Sin esta opción WeasyPrint no encuentra las DLLs.
3. Reiniciar la terminal (y el IDE) para que el `PATH` actualizado sea visible.
4. Verificar:
   ```bash
   python -c "from weasyprint import HTML; print(HTML(string='<h1>ok</h1>').write_pdf()[:8])"
   ```
   Debe imprimir `b'%PDF-1.7\n'` sin lanzar excepción.

### Linux

```bash
sudo apt install libpango-1.0-0 libpangoft2-1.0-0
```

### macOS

```bash
brew install pango
```

### ¿Cómo saber que está fallando?

Cuando WeasyPrint no puede cargar las librerías nativas, el log del backend muestra:

```
WARNING  WeasyPrint no pudo renderizar el PDF (cannot load library 'libgobject-2.0-0'). En Windows instala GTK3 Runtime...
```

Si ves este warning en los logs, los reportes están saliendo en texto plano; instalá las dependencias nativas y reiniciá el servidor.

---

## 🚧 Problemas comunes

- **`ModuleNotFoundError: No module named 'django'`** → el venv no está activado. Volvé a hacer `source venv/bin/activate` (o `venv\Scripts\activate`).
- **`SECRET_KEY` no configurado** → faltó copiar `env.template` a `.env` o generar la clave.
- **CORS bloquea las peticiones** → revisar que `VITE_API_URL` apunte al backend correcto y que `CORS_ALLOWED_ORIGINS` incluya `http://localhost:5173`.
- **`UnicodeEncodeError` en Windows al imprimir tildes** → es solo cosmético en la consola `cmd`; los datos se guardan bien. Usá `chcp 65001` para forzar UTF-8 si te molesta.
- **El frontend muestra 401 todo el rato** → los tokens del localStorage caducaron. Cerrá sesión, borrá `access_token`/`refresh_token` desde DevTools, volvé a entrar.
- **Migraciones pendientes después de pull** → siempre correr `python manage.py migrate` después de un `git pull`.

---

## 📚 Documentación adicional

- [docs/IMPLEMENTATION_SUMMARY.md](docs/IMPLEMENTATION_SUMMARY.md) — Resumen de implementación y roadmap futuro.
- [docs/OPERATIONS.md](docs/OPERATIONS.md) — Guía de operaciones para producción (backups, systemd, monitoreo).
- [docs/Ola2/](docs/Ola2/) — Documentación de iteraciones previas.
- **Backend**: [backend/SETUP_ENV.md](backend/SETUP_ENV.md) — Guía paso a paso de variables de entorno.
- **API**: http://localhost:8000/api/docs/ (Swagger) y http://localhost:8000/api/redoc/ (ReDoc) cuando el backend está corriendo.

---

## 🤝 Contribuir

1. Crear rama: `git checkout -b feature/mi-cambio`
2. Hacer cambios y `git commit`
3. Push y abrir Pull Request

---

## 📄 Licencia

Uso interno — Universidad de Holguín.
