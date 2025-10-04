# 🚀 Guía de Uso Rápido - Swagger UI

## ✅ ¡Documentación Mejorada y Organizada!

La documentación de Swagger UI ahora cuenta con una **organización visual mejorada** que facilita la navegación y uso de la API TUho.

## 🎯 **Nuevas Características**

### 📱 **Interfaz Visual Mejorada**
- **🎨 Emojis organizacionales**: Cada módulo tiene su emoji distintivo
- **📋 Descripciones detalladas**: Cada sección explica claramente su propósito
- **🔍 Filtro de búsqueda**: Encuentra endpoints rápidamente
- **💾 Persistencia de autenticación**: Tu token se mantiene entre sesiones

### 🏷️ **Organización por Módulos**

La API está ahora organizada en **13 módulos principales**:

#### 🔐 **Autenticación**
- Login/Logout con JWT
- Registro y activación de cuentas
- Recuperación de contraseñas
- Gestión de perfil

#### 👥 **Usuarios** (Solo Administradores)
- CRUD completo de usuarios
- Gestión de roles y permisos

#### 🔔 **Notificaciones**
- Sistema de mensajería interno
- Control de lectura/no lectura

#### 🏛️ **Atención a la Población**
- Solicitudes ciudadanas
- Seguimiento de casos

#### 📰 **Plataforma - Noticias**
- Gestión de contenido público
- Publicación de anuncios

#### ✉️ **Plataforma - Email**
- Configuración SMTP del sistema

#### 📊 **Plataforma - Estados**
- Estados de tramitación

#### 🎓 **Secretaría Docente**
- Trámites académicos
- Certificados y constancias

#### 🏨 **Procedimientos - Huéspedes**
- Gestión de visitantes
- Control de alojamiento

#### 🍽️ **Procedimientos - Alimentación**
- Servicios de comedor
- Gestión de menús

#### 🏢 **Procedimientos - Estructura**
- Departamentos y áreas
- Organización institucional

#### 🚗 **Procedimientos - Transporte**
- Solicitudes de transporte
- Programación de viajes

#### 🔧 **Procedimientos - Mantenimiento**
- Reportes de problemas
- Gestión de reparaciones

## 🛠️ **Cómo Usar Swagger UI**

### 1️⃣ **Acceder a la Documentación**
```
http://127.0.0.1:8000/api/docs/
```

### 2️⃣ **Autenticarse en Swagger**
1. Haz clic en el botón **"Authorize"** (🔓) en la parte superior
2. Obtén un token JWT desde `/api/v1/auth/login/`
3. Ingresa: `Bearer tu_token_jwt_aqui`
4. Haz clic en **"Authorize"**

### 3️⃣ **Navegar por Módulos**
- **🔍 Filtra**: Usa la barra de búsqueda para encontrar endpoints específicos
- **📂 Expande**: Haz clic en las secciones para ver los endpoints
- **▶️ Prueba**: Usa "Try it out" para ejecutar requests en vivo

### 4️⃣ **Probar Endpoints**
1. Expande el endpoint que quieres probar
2. Haz clic en **"Try it out"**
3. Completa los parámetros necesarios
4. Haz clic en **"Execute"**
5. Revisa la respuesta en la sección "Response"

## 🔧 **Funcionalidades Avanzadas**

### 🎛️ **Configuraciones Personalizadas**
- **Deep Linking**: URLs persistentes para endpoints específicos
- **Persistencia de Auth**: Tu autenticación se mantiene automáticamente
- **Modelos Expandidos**: Ver estructuras de datos completas
- **Duración de Requests**: Tiempo de respuesta mostrado

### 📊 **Información de Respuestas**
- **Códigos HTTP**: Claramente explicados
- **Esquemas de Datos**: Estructuras JSON detalladas
- **Ejemplos**: Requests y responses de muestra
- **Headers**: Información de headers requeridos

## 💡 **Consejos de Uso**

### 🎯 **Para Desarrolladores Frontend**
1. **Explora primero** los endpoints de autenticación
2. **Copia** los ejemplos de request/response
3. **Usa** los filtros para encontrar endpoints específicos
4. **Guarda** los tokens JWT para pruebas continuas

### 👨‍💼 **Para Administradores**
1. **Revisa** los permisos de cada endpoint
2. **Prueba** la creación de usuarios y roles
3. **Configura** los parámetros de email y notificaciones
4. **Monitorea** los endpoints de gestión

### 🎓 **Para Personal Académico**
1. **Enfócate** en la sección "Secretaría Docente"
2. **Prueba** la creación de trámites
3. **Revisa** los estados de tramitación
4. **Explora** las notificaciones del sistema

## 📋 **Flujo de Trabajo Recomendado**

### 🚀 **Inicio Rápido**
```bash
# 1. Autenticarse
POST /api/v1/auth/login/
{
    "username": "tu_usuario",
    "password": "tu_contraseña"
}

# 2. Usar token en headers
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...

# 3. Probar endpoints según tu rol
GET /api/v1/noticias/          # Públicas
GET /api/v1/notificaciones/    # Personales
POST /api/v1/tramites-secretaria/  # Crear trámite
```

### 🔄 **Renovar Token**
```bash
POST /api/v1/auth/token/refresh/
{
    "refresh": "tu_refresh_token"
}
```

## 🆘 **Resolución de Problemas**

### ❌ **Token Expirado**
- Síntoma: Error 401 "Token is invalid or expired"
- Solución: Usa el endpoint `/api/v1/auth/token/refresh/`

### ❌ **Sin Permisos**
- Síntoma: Error 403 "You do not have permission"
- Solución: Verificar que tu usuario tenga el rol adecuado

### ❌ **Endpoint no Encontrado**
- Síntoma: Error 404 "Not found"
- Solución: Verificar la URL y método HTTP correcto

## 📞 **Soporte**

- **Email**: secretariadocenteuho@gmail.com
- **Documentación Completa**: [ReDoc](http://127.0.0.1:8000/api/redoc/)
- **Schema JSON**: [OpenAPI](http://127.0.0.1:8000/api/schema/)

---

## 🎉 **¡Disfruta la Nueva Experiencia!**

La documentación ahora es más intuitiva, visual y fácil de usar. Cada módulo está claramente identificado y organizado para que encuentres rápidamente lo que necesitas.