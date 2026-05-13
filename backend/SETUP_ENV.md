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

---

## 🔐 Autenticación externa (opcional)

El sistema permite autenticar usuarios contra fuentes externas
(LDAP, API REST, futuros OAuth2/SAML/OIDC) sin reemplazar la autenticación
local. La capa está **deshabilitada por defecto** y se administra desde
`/admin/ldap` (solo superusuarios) sin reiniciar el servidor.

> 📖 Documentación arquitectónica completa: [`docs/EXTERNAL_AUTH.md`](../docs/EXTERNAL_AUTH.md).

### Proveedores soportados

| Proveedor | Dependencia | Cuándo usar |
|---|---|---|
| `ldap` (LDAP directo) | `python-ldap` | Acceso directo al directorio institucional |
| `http_api` (HTTP REST) | `requests` | API REST como `https://auth.uho.edu.cu` |

### Variables de entorno

Solo secrets van por `.env`. El resto se administra desde la UI.

```env
# LDAP — password de la cuenta técnica (bind_dn)
LDAP_BIND_PASSWORD=
# LDAP_TLS_CA_CERTFILE=/etc/ssl/certs/uho-ldap-ca.pem

# HTTP API — bearer token estático opcional (se envía como Authorization)
EXTERNAL_AUTH_HTTP_API_TOKEN=
```

### Instalación de python-ldap

#### Linux / macOS

```bash
# Ubuntu/Debian
sudo apt install libsasl2-dev libldap2-dev libssl-dev
pip install -r requirements.txt
```

#### Windows

`python-ldap` requiere wheels precompilados. Opciones:

1. **pip** (suele funcionar con Python 3.10+):
   ```powershell
   pip install python-ldap
   ```
2. **Wheels de Christoph Gohlke** si pip falla:
   ```powershell
   pip install "https://download.lfd.uci.edu/pythonlibs/.../python_ldap-3.4.4-cp312-cp312-win_amd64.whl"
   ```

Si no logras instalar `python-ldap`, **no pasa nada**: el backend LDAP detecta
el import fallido y se auto-deshabilita; el sistema sigue funcionando con
autenticación local.

### Activación con LDAP directo

1. Edita `.env` y añade `LDAP_BIND_PASSWORD=...`
2. Inicia sesión como superusuario → menú → **Autenticación externa**
3. Selecciona **LDAP directo** en el selector de proveedor
4. Configura URI, bind DN, base de búsqueda, mapeo de roles
5. **Pestaña "Probar"** → ejecuta el test de conexión
6. Cuando todo esté ok, marca el toggle **"Autenticación externa habilitada"**
7. Guarda. Los usuarios LDAP podrán iniciar sesión con sus credenciales
   institucionales en `/login` (endpoint y formulario no cambian).

### Activación con HTTP API (caso `auth.uho.edu.cu`)

1. Edita `.env` y añade `EXTERNAL_AUTH_HTTP_API_TOKEN=...` (solo si la API
   requiere un bearer token estático).
2. Inicia sesión como superusuario → menú → **Autenticación externa**
3. Selecciona **API HTTP REST** en el selector de proveedor
4. Configura:
   - `http_api_base_url`: `https://auth.uho.edu.cu`
   - `http_api_login_path`: el path del endpoint de login (verificar con
     el equipo de redes UHo; default `/api/login`)
   - `http_api_username_field` / `http_api_password_field`: nombres de
     los campos en el body (defaults `username`/`password`)
   - `http_api_user_path` y `http_api_attr_*`: mapeo del JSON de respuesta
     a los atributos del User local (notación de punto)
   - `http_api_groups_path`: dónde encontrar la lista de roles/grupos en
     la respuesta (ej. `roles`, `user.groups`)
5. **Pestaña "Probar"** → introduce un usuario y password reales y ejecuta el
   test. Verifica que se extrae correctamente el `email`, `first_name`, etc.
6. Marca el toggle **"Autenticación externa habilitada"** y guarda.

### Sincronización masiva LDAP (opcional)

Solo aplica cuando `provider='ldap'`. Para HTTP API la sync es lazy
(se crea el usuario en el primer login).

```bash
# Listar sin crear:
python manage.py sync_ldap_users --dry-run

# Crear/actualizar en BD:
python manage.py sync_ldap_users --limit 100
```

### Endpoints (superuser only)

| Método | URL                              | Acción                                   |
|--------|----------------------------------|------------------------------------------|
| GET    | `/api/v1/settings/ldap/`         | Leer configuración + flags de secrets    |
| PATCH  | `/api/v1/settings/ldap/`         | Actualizar configuración (cualquier provider) |
| POST   | `/api/v1/settings/ldap/test/`    | Probar el provider activo (con overrides opt.) |

### Variables `.env` relevantes

| Variable                          | Provider | Uso |
|-----------------------------------|----------|-----|
| `LDAP_BIND_PASSWORD`              | ldap     | Password del bind DN técnico |
| `LDAP_TLS_CA_CERTFILE`            | ldap     | Path al certificado CA propio |
| `EXTERNAL_AUTH_HTTP_API_TOKEN`    | http_api | Bearer token estático para `Authorization` |

### Rollback rápido

Si la autenticación externa rompe el login:

```python
# En manage.py shell:
from apps.settings_runtime.models import LdapConfig
LdapConfig.objects.filter(pk=1).update(enabled=False)
LdapConfig.invalidate_cache()
```

El próximo login usará solo autenticación local.

### Extender con nuevos proveedores

Ver [`docs/EXTERNAL_AUTH.md`](../docs/EXTERNAL_AUTH.md) §3.3 para añadir
OAuth2, SAML u otros proveedores sin tocar el backend Django.

