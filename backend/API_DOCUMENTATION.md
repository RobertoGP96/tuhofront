# 📚 Documentación API TUho

## 🎓 Descripción General

La API TUho es un **sistema integral de gestión universitaria** que proporciona endpoints organizados para la administración de usuarios, trámites académicos, procedimientos internos y servicios estudiantiles.

## 🚀 Acceso a la Documentación

Una vez que el servidor esté ejecutándose, puedes acceder a la documentación interactiva en las siguientes URLs:

- **🔍 ReDoc**: `http://127.0.0.1:8000/api/redoc/` - Documentación completa y detallada
- **⚡ Swagger UI**: `http://127.0.0.1:8000/api/docs/` - Interfaz interactiva para probar endpoints
- **📄 Schema OpenAPI**: `http://127.0.0.1:8000/api/schema/` - Esquema JSON de la API

### ✨ **¡Nuevo! Interfaz Mejorada de Swagger**

La documentación ahora incluye:

- 🎨 **Organización visual con emojis** para fácil navegación
- 📋 **Descripciones detalladas** para cada módulo
- 🔍 **Filtros avanzados** para buscar endpoints
- 💾 **Persistencia de autenticación** entre sesiones
- 🚀 **Guía de inicio rápido** integrada
- 📊 **Códigos de respuesta** claramente documentados

## Autenticación

### 1. Obtener Token de Acceso

**Endpoint**: `POST /api/v1/auth/login/`

**Datos requeridos**:
```json
{
    "username": "tu_usuario",
    "password": "tu_contraseña"
}
```

**Respuesta exitosa**:
```json
{
    "user": {
        "id": 1,
        "username": "usuario123",
        "email": "usuario@uho.edu.cu",
        "first_name": "Juan",
        "last_name": "Pérez",
        "groups": ["Usuario"]
    },
    "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
    "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
    "message": "Login successful"
}
```

### 2. Usar el Token

Incluye el token de acceso en el header de todas las peticiones:

```
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
```

### 3. Renovar Token

**Endpoint**: `POST /api/v1/auth/token/refresh/`

**Datos requeridos**:
```json
{
    "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

## 📋 Principales Módulos de la API

### 🔐 **Autenticación y Seguridad**
- **Endpoint base**: `/api/v1/auth/`
- **Permisos**: Acceso público para registro/login
- **Funciones**: Login, registro, tokens JWT, validación, recuperación de contraseñas

### 👥 **Gestión de Usuarios**
- **Endpoint base**: `/api/v1/usuarios/`
- **Permisos**: Solo administradores
- **Funciones**: CRUD completo de usuarios, roles y permisos

### 🔔 **Sistema de Notificaciones**
- **Endpoint base**: `/api/v1/notificaciones/`
- **Permisos**: Staff puede crear, usuarios pueden leer las suyas
- **Funciones**: Notificaciones internas, marcado de leído, historial

### 🏛️ **Atención a la Población**
- **Endpoint base**: `/api/v1/atencion_poblacion/`
- **Permisos**: Usuarios ven solo las suyas, staff ve todas
- **Funciones**: Solicitudes ciudadanas, seguimiento, respuestas oficiales

### 📰 **Plataforma de Contenido**
- **Noticias**: `/api/v1/noticias/` - Publicación y gestión de noticias
- **Email**: `/api/v1/emails/` - Configuración SMTP del sistema
- **Estados**: `/api/v1/estados-tramites/` - Estados de tramitación

### 🎓 **Servicios Académicos**
- **Endpoint base**: `/api/v1/tramites-secretaria/`
- **Permisos**: Usuarios ven solo los suyos, staff ve todos
- **Funciones**: Certificados, constancias, trámites estudiantiles

### 🏢 **Procedimientos Internos**
- **🏨 Huéspedes**: `/api/v1/guests/` - Gestión de visitantes
- **🍽️ Alimentación**: `/api/v1/feeding-procedures/` - Servicios de comedor
- **🚗 Transporte**: `/api/v1/transport-procedures/` - Solicitudes de transporte
- **🔧 Mantenimiento**: `/api/v1/maintance-procedures/` - Reparaciones y mantenimiento
- **🗂️ Estructura**: `/api/v1/internal-departments/`, `/api/v1/internal-areas/` - Organización interna

## Ejemplos de Uso

### Crear una Notificación

```bash
curl -X POST "http://127.0.0.1:8000/api/v1/notificaciones/" \
  -H "Authorization: Bearer tu_token_aqui" \
  -H "Content-Type: application/json" \
  -d '{
    "tipo": "info",
    "asunto": "Reunión importante",
    "cuerpo": "Se convoca a reunión para el día de mañana",
    "para": 1
  }'
```

### Obtener mis Trámites

```bash
curl -X GET "http://127.0.0.1:8000/api/v1/tramites-secretaria/" \
  -H "Authorization: Bearer tu_token_aqui"
```

### Crear un Trámite

```bash
curl -X POST "http://127.0.0.1:8000/api/v1/tramites-secretaria/" \
  -H "Authorization: Bearer tu_token_aqui" \
  -H "Content-Type: application/json" \
  -d '{
    "tipo_tramite": "Certificado de Notas",
    "descripcion": "Necesito certificado para beca",
    "urgente": false
  }'
```

## Códigos de Estado HTTP

- **200 OK**: Operación exitosa
- **201 Created**: Recurso creado exitosamente
- **400 Bad Request**: Error en los datos enviados
- **401 Unauthorized**: No autorizado (token inválido o ausente)
- **403 Forbidden**: Sin permisos para realizar la acción
- **404 Not Found**: Recurso no encontrado
- **500 Internal Server Error**: Error interno del servidor

## Paginación

Los endpoints que retornan listas están paginados. Ejemplo de respuesta:

```json
{
    "count": 100,
    "next": "http://127.0.0.1:8000/api/v1/noticias/?page=2",
    "previous": null,
    "results": [
        // ... elementos de la página actual
    ]
}
```

## Filtros y Búsqueda

Muchos endpoints soportan filtros mediante parámetros de query:

```bash
# Filtrar noticias por fecha
GET /api/v1/noticias/?on_create__gte=2024-01-01

# Buscar usuarios por nombre
GET /api/v1/usuarios/?search=juan

# Filtrar trámites por estado
GET /api/v1/tramites-secretaria/?estado=pendiente
```

## Consideraciones de Seguridad

1. **Tokens JWT**: Tienen expiración automática (60 minutos para access, 7 días para refresh)
2. **CORS**: Configurado para permitir requests desde el frontend
3. **Permisos**: Sistema de permisos granular basado en roles
4. **Passwords**: Nunca se devuelven en las respuestas de la API

## Soporte y Contacto

Para soporte técnico o reportar problemas:
- Email: secretariadocenteuho@gmail.com
- Documentación técnica: Revisar el código en el repositorio

## Versiones

- **v1.0.0**: Versión inicial con funcionalidades básicas
- La documentación se actualiza automáticamente con cada cambio en el código