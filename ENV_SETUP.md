# Configuración de Variables de Entorno

## ✅ Estado Actual

El proyecto ahora está configurado para usar variables de entorno de forma segura. El archivo `backend/config/settings.py` ha sido actualizado para cargar automáticamente las variables desde `backend/.env`.

## Frontend

Crea un archivo `.env` en la raíz del proyecto con:

```env
# URL base de la API del backend
VITE_API_BASE_URL=http://localhost:8000/api
```

## Backend

Crea un archivo `backend/.env` con las siguientes variables:

```env
# ============================================
# SEGURIDAD (OBLIGATORIO)
# ============================================
SECRET_KEY=tu-clave-secreta-generada-aqui
DEBUG=True
ALLOWED_HOSTS=*
DOMAIN=127.0.0.1:8000

# ============================================
# BASE DE DATOS
# ============================================
# SQLite por defecto (no requiere configuración)
# Para PostgreSQL en producción, descomenta y configura:
# DATABASE_ENGINE=django.db.backends.postgresql
# DATABASE_NAME=tuho_db
# DATABASE_USER=tuho_user
# DATABASE_PASSWORD=tuho_password
# DATABASE_HOST=localhost
# DATABASE_PORT=5432

# ============================================
# CORREO ELECTRÓNICO
# ============================================
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=465
EMAIL_USE_TLS=False
EMAIL_USE_SSL=True
EMAIL_HOST_USER=tu_correo@gmail.com
EMAIL_HOST_PASSWORD=tu_contraseña_de_aplicacion
DEFAULT_FROM_EMAIL=noreply@uho.cu

# ============================================
# CORS (Cross-Origin Resource Sharing)
# ============================================
# Orígenes permitidos separados por comas
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173,http://127.0.0.1:3000
CORS_ALLOW_CREDENTIALS=True

# ============================================
# JWT (JSON Web Tokens)
# ============================================
# Tiempo de vida del token de acceso (en minutos)
JWT_ACCESS_TOKEN_LIFETIME=60
# Tiempo de vida del token de refresco (en días)
JWT_REFRESH_TOKEN_LIFETIME=7
```

## 🔑 Generar SECRET_KEY

Para generar una nueva SECRET_KEY de Django, ejecuta:

```bash
cd backend
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

## ⚙️ Cómo Funciona

El archivo `backend/config/settings.py` ahora:

1. ✅ Carga automáticamente variables de entorno desde `backend/.env`
2. ✅ Usa valores por defecto seguros si las variables no están definidas
3. ✅ Mantiene compatibilidad con el código existente
4. ✅ Permite configuración flexible por entorno (desarrollo/producción)

### Variables con Valores por Defecto

Si no defines estas variables en `.env`, se usarán valores por defecto (solo para desarrollo):

- `SECRET_KEY` - Usa un valor por defecto (⚠️ **NO usar en producción**)
- `DEBUG` - `True` por defecto
- `ALLOWED_HOSTS` - `*` por defecto (⚠️ **NO usar en producción**)
- `DOMAIN` - `127.0.0.1:8000` por defecto
- `EMAIL_*` - Usa valores por defecto del código actual

## ⚠️ Importante

- ❌ **NUNCA** commitees archivos `.env` con valores reales
- ✅ El archivo `.env` ya está en `.gitignore`
- ✅ **SIEMPRE** define `SECRET_KEY` en producción
- ✅ **SIEMPRE** establece `DEBUG=False` en producción
- ✅ **SIEMPRE** configura `ALLOWED_HOSTS` apropiadamente en producción

## 🚀 Producción

Para producción, asegúrate de:

1. Generar una nueva `SECRET_KEY` única
2. Establecer `DEBUG=False`
3. Configurar `ALLOWED_HOSTS` con los dominios reales
4. Usar una base de datos PostgreSQL
5. Configurar credenciales de email reales
6. Usar HTTPS y configurar CORS apropiadamente

