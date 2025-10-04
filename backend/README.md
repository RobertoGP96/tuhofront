# 🎓 TUho Backend API - Sistema Integral de Gestión Universitaria

[![Django](https://img.shields.io/badge/Django-5.0.2-green.svg)](https://djangoproject.com/)
[![DRF](https://img.shields.io/badge/Django%20REST-3.15.1-red.svg)](https://www.django-rest-framework.org/)
[![OpenAPI](https://img.shields.io/badge/OpenAPI-3.0-blue.svg)](https://swagger.io/specification/)
[![JWT](https://img.shields.io/badge/JWT-Authentication-orange.svg)](https://jwt.io/)

Este backend Django ha sido adaptado para funcionar como una **API REST completa** para la aplicación React TUho, proporcionando servicios integrales de gestión universitaria.

## 🚀 Características Principales

- **API REST completa** con Django REST Framework
- **Autenticación JWT** con tokens de acceso y refresh  
- **CORS configurado** para React
- **📚 Documentación automática** con Swagger/ReDoc organizada visualmente
- **🛡️ Permisos granulares** por endpoint
- **🎨 Interfaz Swagger mejorada** con emojis y organización modular
- **🔐 Superusuario configurado** para acceso administrativo completo
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

- **🔍 ReDoc**: http://127.0.0.1:8000/api/redoc/ - Documentación completa y detallada
- **⚡ Swagger UI**: http://127.0.0.1:8000/api/docs/ - Interfaz interactiva con organización visual mejorada
- **📄 Schema JSON**: http://127.0.0.1:8000/api/schema/ - Esquema OpenAPI para herramientas externas

### ✨ **¡Nuevo! Interfaz Mejorada de Swagger**
- 🎨 **Organización visual con emojis** para fácil navegación por módulos
- 📋 **Descripciones detalladas** para cada endpoint y parámetro
- 🔍 **Filtros avanzados** para búsqueda rápida de endpoints
- � **Persistencia de autenticación** entre sesiones
- 🚀 **Guía de inicio rápido** integrada en la documentación

## �🔧 Instalación y Configuración

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

### 4. Recopilar archivos estáticos
```bash
python manage.py collectstatic --noinput
```

## 🔑 Acceso Administrativo - **SUPERUSUARIO CONFIGURADO**

### Credenciales del Superusuario
Ya se ha creado un superusuario para acceso completo al sistema:

```
👤 Usuario: platform
🔐 Contraseña: 123456  
📧 Email: admin@uho.edu.cu
🛡️ Tipo: Superusuario (acceso completo a todos los endpoints)
```

### Formas de Usar las Credenciales:

#### 🌐 **Panel de Administración Django**
- **URL**: http://127.0.0.1:8000/admin/
- **Uso**: Administración completa de modelos, usuarios y configuraciones

#### 🔐 **API con JWT (Recomendado para desarrollo)**
1. **Login via API**:
   ```bash
   curl -X POST "http://127.0.0.1:8000/api/v1/auth/login/" \
     -H "Content-Type: application/json" \
     -d '{
       "username": "platform",
       "password": "123456"
     }'
   ```

2. **Login via Swagger UI**:
   - Ir a: http://127.0.0.1:8000/api/docs/
   - Expandir **"🔐 Autenticación"** > **"Iniciar sesión"**
   - Hacer clic en **"Try it out"**
   - Ingresar credenciales y ejecutar
   - Copiar el token de la respuesta

3. **Autenticarse en Swagger**:
   - Hacer clic en el botón **"Authorize"** 🔓 (esquina superior derecha)
   - Ingresar: `Bearer tu_token_jwt_aqui`
   - Hacer clic en **"Authorize"**
   - ¡Ya puedes probar todos los endpoints protegidos!

### 🎯 **Inicio Rápido para Testing**
```bash
# 1. Iniciar servidor
python manage.py runserver

# 2. Abrir Swagger UI
# http://127.0.0.1:8000/api/docs/

# 3. Usar credenciales:
# Usuario: platform
# Contraseña: 123456

# 4. ¡Explorar y probar la API!
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

## � Documentación y Guías Completas

### 📖 **Guías Disponibles**
Este proyecto incluye documentación completa en varios archivos especializados:

- **📋 [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)**: Guía completa de todos los endpoints, autenticación, ejemplos de uso y códigos de respuesta
- **⚡ [SWAGGER_QUICK_GUIDE.md](./SWAGGER_QUICK_GUIDE.md)**: Guía de inicio rápido para usar Swagger UI de manera efectiva
- **🔧 [DOCUMENTATION_SETUP_GUIDE.md](./DOCUMENTATION_SETUP_GUIDE.md)**: Guía técnica para administradores sobre configuración y mantenimiento

### 🎯 **Flujo de Trabajo Recomendado**
1. **Desarrollo/Testing**: Usa Swagger UI con el superusuario para probar endpoints
2. **Integración**: Consulta API_DOCUMENTATION.md para implementar el frontend
3. **Administración**: Usa el panel Django Admin para gestionar datos

## 📊 Módulos de la API

El sistema está organizado en **13 módulos principales** con interfaz visual mejorada:

- 🔐 **Autenticación**: Login, logout, refresh tokens
- 👥 **Usuarios**: Gestión de perfiles y configuraciones
- 📢 **Notificaciones**: Sistema de mensajería interna
- 📋 **Plataforma**: Gestión de formularios y documentos
- 🏥 **Atención Poblacional**: Servicios de salud
- 🔬 **Laboratorios**: Gestión de análisis y resultados
- 📚 **Secretaría Docente**: Administración académica
- 📄 **Procedimientos Internos**: Workflows organizacionales
- 🏠 **Alojamiento**: Procedimientos residenciales
- 🚗 **Transporte**: Gestión de movilidad
- 🔧 **Mantenimiento**: Solicitudes técnicas
- 🌐 **Áreas**: Estructura organizacional

## 🔄 Comandos Útiles de Desarrollo

### Database
```bash
# Crear nuevas migraciones
python manage.py makemigrations

# Aplicar migraciones
python manage.py migrate

# Resetear base de datos (⚠️ cuidado en producción)
python manage.py flush
```

### API Documentation
```bash
# Generar esquema OpenAPI
python manage.py spectacular --file schema.yml

# Validar esquema de documentación
python manage.py spectacular --validate
```

### Testing
```bash
# Ejecutar todos los tests
python manage.py test

# Ejecutar tests de una app específica
python manage.py test apps.usuarios
```

## 🌐 URLs Principales del Sistema

| Función | URL | Descripción |
|---------|-----|-------------|
| 🏠 **Admin Panel** | `/admin/` | Panel de administración Django |
| 📖 **API Docs (ReDoc)** | `/api/redoc/` | Documentación completa y detallada |
| ⚡ **API Docs (Swagger)** | `/api/docs/` | Interfaz interactiva mejorada |
| 📄 **API Schema** | `/api/schema/` | Esquema OpenAPI para herramientas |
| 🔐 **API Login** | `/api/v1/auth/login/` | Endpoint de autenticación |

## 🤝 Estructura del Proyecto

```
backend/
├── apps/                 # Aplicaciones Django organizadas por módulo
│   ├── api/              # API principal y autenticación
│   ├── usuarios/         # Gestión de usuarios
│   ├── notificaciones/   # Sistema de notificaciones
│   ├── plataforma/       # Gestión de formularios
│   ├── atencion_poblacion/ # Servicios de salud
│   ├── secretaria_docente/ # Administración académica
│   ├── internal_procedures/ # Workflows organizacionales
│   └── ...              # Otros módulos funcionales
├── config/              # Configuración principal de Django
├── static/              # Archivos estáticos
└── requirements.txt     # Dependencias Python
```

## �🐛 Solución de Problemas

### ⚠️ **Warning de pkg_resources**
Si ves warnings sobre `pkg_resources`, es normal y no afecta la funcionalidad. Se debe a una dependencia de `djangorestframework-simplejwt`.

### 🌐 **Errores de CORS**
Asegúrate de que tu frontend esté ejecutándose en uno de los dominios permitidos en la configuración CORS.

### 🔑 **Token Expirado**
Los tokens de acceso expiran en 60 minutos. Usa el token refresh para obtener uno nuevo o vuelve a hacer login.

### 📖 **Documentación no se carga**
Si la documentación no se renderiza:
1. Verifica que el servidor esté ejecutándose
2. Revisa que no haya errores en el schema: `python manage.py spectacular --validate`
3. Limpia el cache del navegador

---

## 📞 Soporte y Contacto

Para preguntas técnicas o soporte:
- 📧 **Email**: admin@uho.edu.cu
- 🏛️ **Institución**: Universidad de Holguín
- 💻 **Plataforma**: Sistema Integrado de Gestión Universitaria
- 🌐 **Documentación**: Disponible en `/api/docs/` y `/api/redoc/`

---

### 🚀 **Estado del Proyecto**
✅ **API REST** completamente funcional  
✅ **Documentación automática** con Swagger UI y ReDoc  
✅ **Autenticación JWT** implementada  
✅ **13 módulos** organizados y documentados  
✅ **Superusuario** configurado para testing  
✅ **Interfaz visual** mejorada con emojis y organización

---

*💡 **Tip para Desarrolladores**: Para una experiencia óptima, usa las credenciales del superusuario (`platform` / `123456`) para explorar todas las funcionalidades de la API a través de Swagger UI en http://127.0.0.1:8000/api/docs/*