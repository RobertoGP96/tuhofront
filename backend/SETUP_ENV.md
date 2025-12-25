# 🚀 Guía Rápida de Configuración de Variables de Entorno

## Paso 1: Crear archivo .env

Copia el archivo de ejemplo:

```bash
cd backend
copy .env.example .env
```

En Linux/Mac:
```bash
cd backend
cp .env.example .env
```

## Paso 2: Generar SECRET_KEY

Ejecuta este comando para generar una nueva SECRET_KEY:

```bash
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

Copia la clave generada y pégala en `backend/.env` como valor de `SECRET_KEY`.

## Paso 3: Configurar Variables Mínimas

Abre `backend/.env` y configura al menos estas variables:

```env
SECRET_KEY=tu-clave-generada-aqui
DEBUG=True
ALLOWED_HOSTS=*
DOMAIN=127.0.0.1:8000
```

## Paso 4: Configurar Email (Opcional)

Si necesitas enviar correos, configura:

```env
EMAIL_HOST_USER=tu_correo@gmail.com
EMAIL_HOST_PASSWORD=tu_contraseña_de_aplicacion
```

## ✅ Verificar Configuración

Ejecuta el servidor para verificar que todo funciona:

```bash
python manage.py runserver
```

Si no hay errores, la configuración es correcta.

## ⚠️ Importante

- ❌ **NUNCA** commitees el archivo `.env` con valores reales
- ✅ El archivo `.env` ya está en `.gitignore`
- ✅ Usa `.env.example` como referencia
- ✅ En producción, genera una nueva `SECRET_KEY` única

## 📚 Más Información

Ver `ENV_SETUP.md` en la raíz del proyecto para documentación completa.

