# TUho Backend API

Este backend Django ha sido adaptado para funcionar como una API REST completa para la aplicación React TUho.

## 🚀 Características Principales

- **API REST completa** con Django REST Framework
- **Autenticación JWT** con tokens de acceso y refresh
- **CORS configurado** para React
- **Documentación automática** con Swagger/ReDoc
- **Permisos granulares** por endpoint
- **Versionado de API** (v1)

## 📋 Endpoints Principales

### Autenticación
- `POST /api/v1/auth/login/` - Iniciar sesión
- `POST /api/v1/auth/logout/` - Cerrar sesión
- `POST /api/v1/auth/register/` - Registrar usuario
- `GET /api/v1/auth/profile/` - Obtener perfil del usuario
- `POST /api/v1/auth/token/` - Obtener token JWT
- `POST /api/v1/auth/token/refresh/` - Renovar token JWT

### Plataforma
- `GET/POST /api/v1/noticias/` - Noticias
- `GET/POST /api/v1/estados-tramites/` - Estados de trámites

### Secretaría Docente
- `GET/POST /api/v1/tramites-secretaria/` - Trámites de secretaría

### Procedimientos Internos
- `GET/POST /api/v1/feeding-procedures/` - Procedimientos de alimentación
- `GET/POST /api/v1/accommodation-procedures/` - Procedimientos de alojamiento
- `GET/POST /api/v1/transport-procedures/` - Procedimientos de transporte
- `GET/POST /api/v1/maintance-procedures/` - Procedimientos de mantenimiento

### Administración
- `GET/POST /api/v1/usuarios/` - Gestión de usuarios (solo admin)
- `GET/POST /api/v1/areas/` - Áreas y departamentos

## 📖 Documentación de la API

Una vez que el servidor esté ejecutándose, puedes acceder a la documentación automática:

- **Swagger UI**: http://127.0.0.1:8000/api/docs/
- **ReDoc**: http://127.0.0.1:8000/api/redoc/
- **Schema JSON**: http://127.0.0.1:8000/api/schema/

## 🔧 Instalación y Configuración

### 1. Crear y activar entorno virtual
```bash
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1  # Windows PowerShell
# o
source venv/bin/activate  # Linux/Mac
```

### 2. Instalar dependencias
```bash
pip install -r requirements.txt
```

### 3. Ejecutar migraciones
```bash
python manage.py makemigrations
python manage.py migrate
```

### 4. Crear superusuario (opcional)
```bash
python manage.py createsuperuser
```

### 5. Iniciar servidor
```bash
python manage.py runserver
```

El servidor estará disponible en `http://127.0.0.1:8000/`

## 🔐 Autenticación

La API usa JSON Web Tokens (JWT) para autenticación:

### Ejemplo de login:
```javascript
const response = await fetch('http://127.0.0.1:8000/api/v1/auth/login/', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    username: 'tu_usuario',
    password: 'tu_contraseña'
  })
});

const data = await response.json();
// data.access contiene el token de acceso
// data.refresh contiene el token de refresh
// data.user contiene la información del usuario
```

### Usar el token en requests:
```javascript
const response = await fetch('http://127.0.0.1:8000/api/v1/noticias/', {
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  }
});
```

## 🛡️ Permisos

- **Usuarios normales**: Pueden ver y crear sus propios trámites/procedimientos
- **Staff**: Pueden ver todos los trámites y cambiar estados
- **Administradores**: Acceso completo a usuarios y configuración

## 🌐 CORS

El backend está configurado para aceptar requests desde:
- `http://localhost:3000` (Create React App)
- `http://localhost:5173` (Vite)
- `http://127.0.0.1:3000`
- `http://127.0.0.1:5173`

## 📝 Notas Importantes

1. **Migración gradual**: Las URLs legacy siguen funcionando para compatibilidad
2. **Archivos**: Los endpoints que manejan archivos requieren `Content-Type: multipart/form-data`
3. **Paginación**: Los listados están paginados con 20 elementos por página
4. **Filtrado**: Los usuarios solo ven sus propios trámites/procedimientos

## 🔄 URLs Legacy (Compatibilidad)

Las siguientes URLs siguen disponibles durante la transición:
- `/Usuarios/` - Gestión de usuarios con templates
- `/AtencionPoblacion/` - Atención a la población
- `/Notificaciones/` - Sistema de notificaciones
- `/SecretariaDocente/` - Secretaría docente con templates

## 🐛 Solución de Problemas

### Warning de pkg_resources
Si ves warnings sobre `pkg_resources`, es normal y no afecta la funcionalidad. Se debe a una dependencia de `djangorestframework-simplejwt`.

### CORS Errors
Asegúrate de que tu frontend esté ejecutándose en uno de los dominios permitidos en la configuración CORS.

### Token Expirado
Los tokens de acceso expiran en 60 minutos. Usa el token refresh para obtener uno nuevo.