# TUhoFront - Sistema Integral de Gestión Universitaria

Sistema full-stack para la gestión integral de servicios universitarios de la Universidad de Holguín.

## 🏗️ Arquitectura del Proyecto

Este proyecto está dividido en dos partes principales:

```
tuhofront/
├── backend/          # API Django REST Framework
├── src/              # Frontend React + TypeScript + Vite
├── public/           # Assets estáticos
└── dist/             # Build de producción
```

## 🚀 Inicio Rápido

### Prerrequisitos

- **Node.js** 18+ y **pnpm** (o npm/yarn)
- **Python** 3.10+
- **PostgreSQL** (opcional, SQLite por defecto)

### Frontend

```bash
# Instalar dependencias
pnpm install

# Iniciar servidor de desarrollo
pnpm dev

# Build para producción
pnpm build
```

### Backend

```bash
cd backend

# Crear entorno virtual
python -m venv venv

# Activar entorno virtual
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Instalar dependencias
pip install -r requirements.txt

# Configurar variables de entorno
# Copia backend/.env.example a backend/.env y completa los valores
# Ver ENV_SETUP.md para más detalles

# Ejecutar migraciones
python manage.py migrate

# Crear superusuario
python manage.py createsuperuser

# Iniciar servidor de desarrollo
python manage.py runserver
```

## 📋 Configuración

### Variables de Entorno

**🚀 Inicio Rápido**: Ejecuta el script de configuración:

**Windows (PowerShell)**:
```powershell
.\setup-env.ps1
```

**Linux/Mac (Bash)**:
```bash
chmod +x setup-env.sh
./setup-env.sh
```

**Manual**: Copia los archivos template:

**Frontend**: 
```bash
copy env.template .env
```
Edita `.env` y configura:
```env
VITE_API_BASE_URL=http://localhost:8000/api
```

**Backend**: 
```bash
cd backend
copy env.template .env
```
Genera SECRET_KEY:
```bash
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```
Edita `backend/.env` y configura:
```env
SECRET_KEY=tu-clave-secreta-generada
DEBUG=True
ALLOWED_HOSTS=*
DOMAIN=127.0.0.1:8000
```

📚 Ver `CREAR_ENV.md` para guía paso a paso o `ENV_SETUP.md` para documentación completa.

## 📁 Estructura del Proyecto

### Frontend (`src/`)

```
src/
├── components/       # Componentes reutilizables
│   ├── internal/    # Procedimientos internos
│   ├── platform/    # Componentes de plataforma
│   └── teaching_secretary/  # Secretaría docente
├── pages/           # Páginas/Vistas
├── hooks/           # Custom hooks
├── services/        # Servicios API
├── types/            # Definiciones TypeScript
├── routes/           # Configuración de rutas
├── context/          # Context providers
└── utils/            # Utilidades
```

### Backend (`backend/`)

```
backend/
├── apps/            # Aplicaciones Django
│   ├── api/         # API base
│   ├── usuarios/    # Gestión de usuarios
│   ├── plataforma/  # Plataforma general
│   ├── internal_procedures/  # Procedimientos internos
│   └── secretaria_docente/   # Secretaría docente
├── config/          # Configuración Django
└── static/          # Archivos estáticos
```

## 🔐 Seguridad

- ✅ `SECRET_KEY` se carga desde variables de entorno
- ✅ Credenciales de email en variables de entorno
- ✅ CORS configurado apropiadamente
- ✅ JWT para autenticación

**⚠️ IMPORTANTE**: Nunca commitees archivos `.env` con valores reales.

## 📚 Documentación

- [Análisis de Estructura](./ANALISIS_ESTRUCTURA.md) - Análisis completo y recomendaciones
- [Configuración de Variables de Entorno](./ENV_SETUP.md) - Guía de configuración
- [Backend README](./backend/README.md) - Documentación del backend
- [API Documentation](./backend/API_DOCUMENTATION.md) - Documentación de la API

## 🛠️ Tecnologías

### Frontend
- **React** 19.1.0
- **TypeScript** 5.8.3
- **Vite** 6.3.5
- **React Router** 7.6.0
- **PrimeReact** 10.9.1
- **TailwindCSS** 4.1.5
- **React Query** 5.75.5

### Backend
- **Django** 5.0.2
- **Django REST Framework** 3.15.1
- **djangorestframework-simplejwt** 5.3.0
- **drf-spectacular** 0.27.2
- **python-dotenv** 1.0.1

## 📝 Scripts Disponibles

### Frontend
- `pnpm dev` - Servidor de desarrollo
- `pnpm build` - Build de producción
- `pnpm lint` - Linter
- `pnpm preview` - Preview del build

### Backend
- `python manage.py runserver` - Servidor de desarrollo
- `python manage.py migrate` - Aplicar migraciones
- `python manage.py createsuperuser` - Crear superusuario
- `python manage.py collectstatic` - Recopilar archivos estáticos

## 🤝 Contribución

1. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
2. Commit tus cambios (`git commit -m 'Agrega nueva funcionalidad'`)
3. Push a la rama (`git push origin feature/nueva-funcionalidad`)
4. Abre un Pull Request

## 📄 Licencia

Uso Interno - Universidad de Holguín

## 👥 Equipo

Equipo de Desarrollo TUho - Universidad de Holguín

---

**Versión**: 0.0.0  
**Última actualización**: 2025-01-27

