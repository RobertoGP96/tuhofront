# Autenticación externa en TUho

Guía técnica completa de la **integración de autenticación externa** del
sistema TUho (Universidad de Holguín). Cubre arquitectura, proveedores
soportados, configuración, seguridad, operaciones y cómo extender el
sistema para futuros cambios de autenticación.

---

## 1. Resumen ejecutivo

El sistema TUho permite autenticar usuarios contra fuentes externas
(directorio LDAP institucional, API REST de autenticación, futuros
OAuth2/SAML/OIDC) sin reemplazar la autenticación local. La capa de
autenticación externa es:

- **Opcional** — deshabilitada por defecto. El sistema funciona como antes
  contra la BD local.
- **Configurable en runtime** — toda la configuración (URL, mapeos, etc.)
  vive en BD y se administra desde `/admin/ldap` sin reiniciar el servidor.
- **Pluggable** — múltiples proveedores intercambiables. Cambiar de LDAP a
  API HTTP (o a OAuth2 mañana) es un cambio de configuración, no de código.
- **Seguro por defecto** — secrets solo en variables de entorno, TLS
  obligatorio fuera de DEBUG, audit log de cambios y sincronizaciones.

---

## 2. Arquitectura

```
┌─────────────────┐        ┌───────────────────────────────────────┐
│ POST /auth/     │        │ RuntimeLdapBackend (Django)           │
│ login/          │  ───▶  │   - lee LdapConfig.load() (caché 5min)│
│ {user, pass}    │        │   - dispatch a provider               │
└─────────────────┘        │   - resuelve/crea User local          │
                           │   - sync atributos y rol              │
                           └─────────┬─────────────────────────────┘
                                     │
                  ┌──────────────────┼──────────────────┐
                  ▼                  ▼                  ▼
            ┌──────────┐      ┌──────────┐       ┌─────────────┐
            │ LdapProv │      │ HttpApiP │       │ FutureProv  │
            │ (LDAP)   │      │ (REST)   │  ...  │ (OAuth/SAML)│
            └──────────┘      └──────────┘       └─────────────┘
                                  ▲
                                  │
                       https://auth.uho.edu.cu
```

### Componentes

| Componente | Path | Función |
|---|---|---|
| Backend Django | `apps/platform/auth/ldap.py` → `RuntimeLdapBackend` | Dispatcher de proveedores, persistencia local, audit |
| Contrato proveedor | `apps/platform/auth/providers/base.py` → `ExternalAuthProvider` | Interfaz común (`authenticate()`, `test()`) |
| Provider LDAP | `apps/platform/auth/providers/ldap.py` → `LdapProvider` | python-ldap directo (search-bind) |
| Provider HTTP API | `apps/platform/auth/providers/http_api.py` → `HttpApiProvider` | `requests` contra endpoint REST |
| Modelo de config | `apps/settings_runtime/models.py` → `LdapConfig` | Singleton cacheado (5 min), todos los proveedores |
| Endpoints admin | `apps/settings_runtime/views.py` | `GET/PATCH /api/v1/settings/ldap/`, `POST .../test/` |
| UI admin | `client/src/pages/AdminLdap.tsx` | Panel `/admin/ldap` con tabs por proveedor |

> El nombre `LdapConfig` se mantiene por compatibilidad con la primera
> iteración del feature, pero el modelo soporta **cualquier proveedor**.

### Flujo de un login

1. POST `/api/v1/auth/login/` con `{username, password}` (sin cambios para el frontend).
2. `MyTokenObtainPairSerializer.validate()` llama `authenticate(...)` de
   Django, que recorre `AUTHENTICATION_BACKENDS`:
   1. `AxesStandaloneBackend` — rate-limit por IP+username.
   2. **`RuntimeLdapBackend`** — entrada al sistema de auth externa.
   3. `ModelBackend` — fallback contra BD local.
3. `RuntimeLdapBackend.authenticate()`:
   1. Si `LdapConfig.enabled=False` → retorna `None` (cede a `ModelBackend`).
   2. Resuelve provider con `get_provider(cfg)`.
   3. Llama `provider.authenticate(username, password)` → `AuthResult | None`.
   4. Si éxito: busca/crea `User` local, sincroniza atributos, mapea rol.
   5. Retorna el `User` autenticado.
4. SimpleJWT emite los tokens (access + refresh).

---

## 3. Proveedores soportados

### 3.1 LDAP directo (`provider='ldap'`)

Patrón **search-bind** clásico usando `python-ldap`:

1. Bind anónimo o con `bind_dn` + `LDAP_BIND_PASSWORD` (técnico).
2. Búsqueda del usuario por `user_search_filter` (con `%(user)s` escapado).
3. Re-bind con el DN encontrado y el password del usuario → validación.
4. Búsqueda de grupos a los que pertenece.
5. Mapeo DN-grupo → `user_type` con `group_to_role_map`.

**Cuándo usar**: la institución expone el directorio LDAP directamente.

**Dependencia**: `python-ldap>=3.4.4`. En Windows puede requerir wheels
precompilados — ver [`SETUP_ENV.md`](../backend/SETUP_ENV.md).

### 3.2 API HTTP REST (`provider='http_api'`)

Pensado para servicios institucionales como `https://auth.uho.edu.cu`
que exponen un endpoint HTTP de login. **Completamente configurable**:

- URL = `http_api_base_url + http_api_login_path`
- Método: `POST` (default) o `GET`
- Body: `{<http_api_username_field>: username, <http_api_password_field>: password}`
- Headers: `http_api_extra_headers` + `Authorization: Bearer <token>` si
  `EXTERNAL_AUTH_HTTP_API_TOKEN` está definido.

Respuesta:

- Éxito: status 2xx (o el campo configurado en `http_api_success_field`).
- Atributos del usuario extraídos del JSON con `http_api_user_path` y
  los `http_api_attr_*` fields (notación de punto en paths anidados).
- Grupos extraídos con `http_api_groups_path` (acepta lista de strings
  o lista de objetos con `name`/`role`/`code`).

**Cuándo usar**: la institución expone una API REST de autenticación
en lugar de LDAP directo. Caso actual de UHo (`auth.uho.edu.cu`).

**Dependencia**: `requests>=2.31.0` (puro Python, sin compilación).

#### 3.2.1 Caso real: Universidad de Holguín (`auth.uho.edu.cu`)

> 🎯 **Acceso rápido**: el sistema incluye una pestaña interactiva
> **UHo** dentro de `/admin/ldap` (visible cuando `provider=http_api`) que
> documenta esta sección, aplica los valores recomendados con un botón y
> diagnostica desfases configuración vs. recomendación.

##### Respuesta esperada

El endpoint institucional responde, ante un login exitoso, con una
estructura JSON con la información del usuario, la foto de perfil
(base64) y el rol institucional:

```json
{
  "OK": true,
  "activeUser": {
    "status": 200,
    "account_state": "TRUE",
    "uid": "cmorenot",
    "personal_information": {
      "dni": "94061342900",
      "cn": "CARLOS EMILIO MORENO TEJEDA",
      "given_name": "CARLOS EMILIO",
      "sn": "MORENO TEJEDA",
      "personal_photo": "data:image/png;base64,iVBORw0KGgoAAA…",
      "overlapping": ""
    },
    "account_info": {
      "user_type": "Trabajador",
      "create_user": "Marilin Velázquez Marrero [mvelazquezm]",
      "create_date": "2018-09-05 09:13:43",
      "modify_user": "AGA-CLI",
      "modify_data": "2026-04-29 07:19:52 pm",
      "accept_system_policies": true,
      "password": {
        "user_password_set": "2026-03-31 08:51:14 am",
        "pass_valid": "Valido",
        "pass_set": "46"
      }
    }
  },
  "message": "Inició sesión"
}
```

Ante un login inválido la API responde con `OK=false` (mismo wrapper)
y el provider lo traduce a un `None` que cae al `ModelBackend` si
`fallback_to_local=True`.

##### Configuración recomendada en TUho

| Campo de `LdapConfig` | Valor |
|---|---|
| `provider` | `http_api` |
| `http_api_base_url` | `https://auth.uho.edu.cu` |
| `http_api_login_path` | `/api/login` *(confirmar con redes UHo)* |
| `http_api_method` | `POST` |
| `http_api_username_field` | `username` |
| `http_api_password_field` | `password` |
| `http_api_success_field` | `OK` |
| `http_api_user_path` | `activeUser` |
| `http_api_attr_username` | `uid` |
| `http_api_attr_email` | *(vacío — UHo no devuelve email)* |
| `http_api_attr_first_name` | `personal_information.given_name` |
| `http_api_attr_last_name` | `personal_information.sn` |
| `http_api_attr_id_card` | `personal_information.dni` |
| `http_api_attr_personal_photo` | `personal_information.personal_photo` |
| `http_api_groups_path` | `activeUser.account_info.user_type` |
| `http_api_email_template` | `{username}@uho.edu.cu` |
| `group_to_role_map` | `{"Trabajador":"USUARIO","Estudiante":"USUARIO"}` |
| `default_role` | `USUARIO` |
| `http_api_verify_ssl` | `true` |

Los `http_api_attr_*` admiten **notación de punto** desde la iteración 3
(ver §10.3), por lo que se puede apuntar a campos anidados como
`personal_information.given_name` sin partir el `http_api_user_path`.

##### Mapeo response → User

| Path JSON | Atributo `User` | Nota |
|---|---|---|
| `activeUser.uid` | `username` | Login único institucional |
| `activeUser.personal_information.given_name` | `first_name` | |
| `activeUser.personal_information.sn` | `last_name` | |
| `activeUser.personal_information.dni` | `id_card` | 11 dígitos |
| `activeUser.personal_information.personal_photo` | `personal_photo` | data URL base64 |
| *(no devuelto por la API)* | `email` | Sintetizado con `{username}@uho.edu.cu` |
| `activeUser.account_info.user_type` | → `group_to_role_map` → `user_type` | `"Trabajador"` → `USUARIO` |
| `OK` | flag de éxito | `true` = login válido |

##### Probar con curl

```bash
curl -sk -X POST https://auth.uho.edu.cu/api/login \
  -H 'Content-Type: application/json' \
  -d '{"username":"cmorenot","password":"***"}'
```

La respuesta debe tener la forma documentada arriba. Para probar
desde el panel admin, ir a `/admin/ldap` → tab **Probar** → introducir
`username` + password reales (el password viaja al backend, que lo
reenvía a UHo; nunca se persiste localmente).

##### Limitaciones conocidas (caso UHo)

- `activeUser.account_state == "TRUE"` no se valida explícitamente;
  el provider solo mira `OK == true`.
- `account_info.password.pass_valid == "Valido"` no se valida: un
  usuario con password expirado puede entrar si UHo igualmente
  responde `OK=true`.
- `accept_system_policies == true` no se obliga.
- La foto se almacena como data URL en `User.personal_photo`
  (`TextField`); para gran volumen de usuarios conviene migrar a
  almacenamiento de objetos en el futuro.

### 3.3 Futuros proveedores (OAuth2/SAML/OIDC)

Para añadir un nuevo proveedor:

1. Crear una clase en `apps/platform/auth/providers/<provider>.py` que
   herede de `ExternalAuthProvider` (`base.py`) e implemente:
   - `authenticate(username, password) -> AuthResult | None`
   - `test(**overrides) -> TestResult`
2. Registrar la clase en `apps/platform/auth/providers/__init__.py`:
   ```python
   PROVIDER_REGISTRY = {
       LdapConfig.PROVIDER_LDAP: LdapProvider,
       LdapConfig.PROVIDER_HTTP_API: HttpApiProvider,
       'oauth2': OAuth2Provider,  # nuevo
   }
   ```
3. Añadir `'oauth2'` a `LdapConfig.PROVIDER_CHOICES` (migración
   `AlterField`).
4. Añadir los campos específicos al modelo con prefijo `oauth2_*`
   (migración `AddField`).
5. Frontend: añadir condicional `isOauth2` en `AdminLdap.tsx` y un nuevo
   tab con los campos.

**No se requiere tocar** ni `RuntimeLdapBackend` ni el endpoint de login —
la lógica de creación/sync de usuarios es agnóstica al proveedor.

---

## 4. Configuración

### 4.1 Variables de entorno (`.env`)

Los **secrets nunca van en BD ni en API**. Solo en `.env`:

```env
# LDAP — password de la cuenta técnica (bind_dn)
LDAP_BIND_PASSWORD=

# LDAP — path al certificado CA si usas LDAPS con CA propia
# LDAP_TLS_CA_CERTFILE=/etc/ssl/certs/uho-ldap-ca.pem

# HTTP API — token estático para Authorization: Bearer <token>
EXTERNAL_AUTH_HTTP_API_TOKEN=
```

### 4.2 Modelo `LdapConfig` (BD, editable runtime)

Todos los demás campos viven en el modelo singleton y se editan desde
`/admin/ldap`. Ver `apps/settings_runtime/models.py` para la lista
completa. Resumen por proveedor:

#### Comunes
- `enabled`: master toggle.
- `provider`: `'ldap'` | `'http_api'`.
- `default_role`: rol asignado a usuarios sin grupo mapeado.
- `group_to_role_map`: `{<grupo>: <user_type>}`.
- `make_staff_groups`, `make_superuser_groups`: listas de grupos.
- `auto_create_users`: crear usuarios en primer login.
- `fallback_to_local`: caer a `ModelBackend` si el proveedor falla.
- `sync_on_login`: actualizar atributos en cada login.

#### Específicos LDAP
- `server_uri`, `use_start_tls`, `connect_timeout`, `tls_require_cert`
- `bind_dn`
- `user_search_base`, `user_search_filter` (debe contener `%(user)s`)
- `attr_username`, `attr_email`, `attr_first_name`, `attr_last_name`, `attr_id_card`
- `group_search_base`, `group_search_filter`, `group_type`

#### Específicos HTTP API
- `http_api_base_url`, `http_api_login_path`, `http_api_method`
- `http_api_username_field`, `http_api_password_field`
- `http_api_extra_headers` (JSON, NO incluir `Authorization`)
- `http_api_verify_ssl`, `http_api_timeout`
- `http_api_success_field`, `http_api_user_path`
- `http_api_attr_username`, `http_api_attr_email`, `http_api_attr_first_name`,
  `http_api_attr_last_name`, `http_api_attr_id_card`, `http_api_groups_path`

### 4.3 Caché

El singleton se cachea durante 5 minutos (clave `tuho:ldap_config`,
TTL `LDAP_CONFIG_CACHE_TTL`). Tras cualquier PATCH la vista invalida
la caché con `LdapConfig.invalidate_cache()`.

Para forzar invalidación desde shell:

```python
from apps.settings_runtime.models import LdapConfig
LdapConfig.invalidate_cache()
```

---

## 5. Endpoints API

Todos requieren `is_superuser=True` (clase `IsSuperUser` en
`apps/platform/permissions.py`).

### `GET /api/v1/settings/ldap/`

Devuelve la configuración completa más dos flags de solo-lectura:

- `bind_password_present` — `LDAP_BIND_PASSWORD` está definido.
- `http_api_token_present` — `EXTERNAL_AUTH_HTTP_API_TOKEN` está definido.

### `PATCH /api/v1/settings/ldap/`

Actualiza cualquier campo (parcial). Validaciones:

- `provider` debe ser un valor permitido.
- Si `enabled=True` y `provider=ldap`: `server_uri` y `user_search_base` requeridos.
- Si `enabled=True` y `provider=http_api`: `http_api_base_url` requerido.
- `user_search_filter` debe contener `%(user)s` exactamente una vez.
- `tls_require_cert='never'` rechazado fuera de DEBUG.
- `http_api_base_url=http://` rechazado fuera de DEBUG.
- `http_api_extra_headers` no puede incluir `Authorization`.
- `group_to_role_map` con roles válidos.

Cada PATCH genera un audit log (`action='update'`).

### `POST /api/v1/settings/ldap/test/`

Body opcional con overrides para probar sin guardar:

```json
// LDAP
{"server_uri": "ldaps://...", "bind_dn": "...", "bind_password": "...",
 "test_username": "jdoe", "test_password": "secret"}

// HTTP API
{"http_api_base_url": "https://auth.uho.edu.cu",
 "http_api_login_path": "/api/login",
 "test_username": "jdoe", "test_password": "secret"}
```

Solo los campos en la whitelist `_ALLOWED_OVERRIDES` se aceptan. Los
passwords NUNCA se persisten — solo el `last_test_at/ok/message` se
guarda como auditoría.

Respuesta (forma común, detalles específicos del proveedor en `details`):

```json
{
  "ok": true,
  "message": "Login OK (status 200).",
  "details": {
    "provider": "http_api",
    "url": "https://auth.uho.edu.cu/api/login",
    "status": 200,
    "success": true,
    "extracted": {
      "username": "jdoe",
      "email": "jdoe@uho.edu.cu",
      "first_name": "Juan",
      "last_name": "Doe",
      "groups": ["profesor"]
    }
  },
  "bind_ok": true,
  "user_dn": null,
  "user_attrs": null,
  "groups": [],
  "status": 200,
  "extracted": { ... }
}
```

---

## 6. Frontend

Panel admin `/admin/ldap` accesible desde el dropdown de usuario (solo si
`is_superuser`). Archivos clave en `client/src`:

- `pages/AdminLdap.tsx` — página principal con selector de proveedor y
  tabs condicionales (Conexión, Búsqueda/Respuesta, Grupos, Roles,
  Comportamiento, Probar, **UHo**).
- `services/ldap.service.ts` — cliente HTTP tipado para los endpoints
  (incluye el tipo `ExtractedAttrs` para los atributos parseados desde
  HTTP API).
- `components/admin/LdapTestPanel.tsx` — formulario de prueba
  **provider-aware**: muestra DN/grupos LDAP en modo LDAP y tabla
  de atributos extraídos + mini-preview de la foto en modo HTTP API.
- `components/admin/UhoIntegrationGuide.tsx` — guía interactiva para
  el caso UHo: ejemplo de respuesta, tabla de mapeo, botón
  "Aplicar valores recomendados" y diagnóstico campo a campo.
- `components/admin/LdapGroupRoleMapEditor.tsx` — editor del mapeo
  grupo → rol.
- `components/admin/LdapDnListEditor.tsx` — editor de listas de DNs/grupos.

El tab **UHo** solo aparece cuando `provider=http_api`; ofrece la
configuración recomendada para `auth.uho.edu.cu` con un click.

Para añadir un proveedor en el UI:

1. Extender el tipo `AuthProvider` en `ldap.service.ts`.
2. Añadir entrada en `PROVIDER_OPTIONS` (en `AdminLdap.tsx`).
3. Añadir un bloque condicional en cada tab que aplique
   (`isProvider = config.provider === '<nuevo>'`).

---

## 7. Seguridad

| Vector | Mitigación |
|---|---|
| Secret en BD/API | LDAP_BIND_PASSWORD y EXTERNAL_AUTH_HTTP_API_TOKEN solo en `.env`. Serializer no expone ningún campo password. |
| MITM LDAP plano | `tls_require_cert='demand'` por defecto. Validación en serializer: `'never'` rechazado fuera de DEBUG. Recomendado LDAPS o StartTLS. |
| MITM HTTP API | `http_api_verify_ssl=True` por defecto. Validación: `http://` (sin TLS) rechazado fuera de DEBUG. |
| Inyección LDAP en filter | `ldap.filter.escape_filter_chars()` al sustituir `%(user)s`. Validación: filtro debe contener exactamente un `%(user)s`. |
| ADMIN bloqueado | `fallback_to_local=True` por defecto. `set_unusable_password()` solo en usuarios creados por el proveedor, nunca en superusuarios locales preexistentes. |
| DoS al login | `connect_timeout=5s` (LDAP), `http_api_timeout=10s` (HTTP). Si proveedor cae con fallback ON → ModelBackend toma control silenciosamente. |
| Brute force | `django-axes` intacto, cubre todos los backends vía signal `user_login_failed`. |
| Headers maliciosos | `Authorization` rechazado en `http_api_extra_headers` (validación serializer). |
| Auditoría | `log_event` en: PATCH config, test de conexión, cambio de rol por sync. |
| Carnet faltante | Generador de placeholder de 11 dígitos con prefijo `9` para usuarios externos sin `id_card` (modelo User exige `unique=True`). |

---

## 8. Operaciones

### Habilitar autenticación externa (camino feliz)

1. Asegurar variables de entorno en `.env`:
   - LDAP: `LDAP_BIND_PASSWORD=...`
   - HTTP API: `EXTERNAL_AUTH_HTTP_API_TOKEN=...` (si aplica)
2. Login como superuser → menú → "Autenticación externa".
3. Seleccionar proveedor (LDAP o HTTP API).
4. Completar campos. Para HTTP API contra `auth.uho.edu.cu`:
   - `http_api_base_url`: `https://auth.uho.edu.cu`
   - `http_api_login_path`: el path real del endpoint (consultar al
     equipo de redes de UHo). Default: `/api/login`.
   - Ajustar `http_api_user_path`, `http_api_attr_*` según el shape
     real de la respuesta JSON.
5. Tab **"Probar"** → ejecutar test con un usuario real.
6. Si el test es OK, marcar el toggle **"Autenticación externa habilitada"**.
7. Guardar.

A partir de aquí los usuarios pueden iniciar sesión con sus credenciales
institucionales en `/login` (el formulario no cambia).

### Sincronización masiva LDAP (opcional)

Solo para `provider=ldap`:

```bash
python manage.py sync_ldap_users --dry-run
python manage.py sync_ldap_users --limit 100
```

Crea/actualiza usuarios locales con los datos del directorio sin necesidad
de que cada uno haga login.

### Rollback rápido

Si la autenticación externa rompe el login:

```python
# Django shell:
from apps.settings_runtime.models import LdapConfig
LdapConfig.objects.filter(pk=1).update(enabled=False)
LdapConfig.invalidate_cache()
```

El próximo login usa solo `ModelBackend` (BD local).

---

## 9. Limitaciones conocidas

- **HTTP API: contrato fijo en runtime.** Si el endpoint devuelve una
  estructura no representable con `_walk_path` (notación de punto en
  paths anidados), habría que extender `http_api.py` para añadir lógica
  específica. La mayoría de APIs JSON modernas funcionan con los paths
  configurables actuales.
- **Sin sync periódica HTTP API.** El comando `sync_ldap_users` solo
  aplica a LDAP. Para HTTP API la sincronización es lazy (en cada login).
- **`group_to_role_map` es first-match.** Si un usuario pertenece a
  varios grupos mapeados, gana el primero en el orden de inserción del
  dict.
- **python-ldap en Windows.** En entornos de desarrollo Windows sin
  wheels precompilados, `LdapProvider` se auto-deshabilita (devuelve
  `None`) y el test panel muestra el error de import. El sistema sigue
  funcionando con `ModelBackend`.

---

## 10. Cambios respecto a la primera iteración

Resumen de la evolución del feature (en este orden):

### Iteración 1 — LDAP integrado

- Modelo `LdapConfig` (singleton, cache 5min).
- Backend `RuntimeLdapBackend` heredando de `django_auth_ldap.LDAPBackend`.
- Helper `ldap_test_connection` con `python-ldap`.
- Endpoints `/api/v1/settings/ldap/` + `/api/v1/settings/ldap/test/`.
- Comando `python manage.py sync_ldap_users`.
- UI `/admin/ldap` con tabs (Conexión, Búsqueda, Grupos, Roles, Test).
- Vars: `LDAP_BIND_PASSWORD`, `LDAP_TLS_CA_CERTFILE`.

### Iteración 2 — Refactor a proveedores pluggables (este documento)

- Nuevo campo `LdapConfig.provider` (`'ldap'` | `'http_api'`).
- Nuevos campos `http_api_*` (16 campos) para configurar el endpoint REST.
- Migración `0003_externalauth_provider.py` (additiva, sin breaking).
- Nuevo paquete `apps/platform/auth/providers/` con:
  - `base.py`: `ExternalAuthProvider`, `AuthResult`, `TestResult`.
  - `ldap.py`: `LdapProvider` usando `python-ldap` directo (sin
    django-auth-ldap, reduciendo deps).
  - `http_api.py`: `HttpApiProvider` usando `requests`.
- `RuntimeLdapBackend` refactorizado a dispatcher genérico. Ya no
  hereda de `LDAPBackend`; la lógica de creación/sync de User es
  agnóstica al proveedor.
- `LdapTestConnectionView` ahora delega en el provider activo.
- Frontend `AdminLdap.tsx` con selector de proveedor y tabs
  condicionales. Página re-titulada a "Autenticación externa".
- Vars adicionales: `EXTERNAL_AUTH_HTTP_API_TOKEN`.
- Quitada dependencia `django-auth-ldap` (reemplazada por implementación
  directa con `python-ldap`).
- Añadida dependencia `requests>=2.31.0`.

El nombre del modelo (`LdapConfig`), del backend (`RuntimeLdapBackend`)
y de las URLs (`/api/v1/settings/ldap/`) se mantuvieron por
compatibilidad. Se podrían renombrar a futuro usando `RenameModel`
+ `path()` con alias temporales.

### Iteración 3 — Integración real con `auth.uho.edu.cu`

- `HttpApiProvider`: los `http_api_attr_*` ahora admiten **notación de
  punto** (vía `_walk_path`), por lo que se puede apuntar a
  `personal_information.given_name` sin partir el `http_api_user_path`.
  Retro-compatible: un path sin puntos sigue siendo un lookup plano.
- Nuevo campo `LdapConfig.http_api_attr_personal_photo` para extraer la
  foto del JSON de la respuesta.
- Nuevo campo `LdapConfig.http_api_email_template` con placeholder
  `{username}` para sintetizar email cuando la API no lo devuelve
  (caso real UHo).
- Nuevo campo `User.personal_photo` (`TextField`) que persiste el data
  URL base64 de la foto. Expuesto vía `UserBaseSerializer`.
- Nuevo dataclass field `AuthResult.personal_photo` (default `''`).
- `RuntimeLdapBackend._resolve_user` persiste y resync la foto en cada
  login si `sync_on_login=True`.
- Frontend: `LdapTestPanel` refactor a **provider-aware** (LDAP /
  HTTP API). Nuevo componente `UhoIntegrationGuide` y nuevo tab "UHo"
  en `/admin/ldap`.
- Tests: `apps.platform.test.test_http_api_uho` con 6 casos cubriendo
  parseo nested, sintetización de email, fallback sin template,
  rechazo cuando `OK=false`, extracción completa vía `test()`, y
  retro-compat con lookups planos.
- Migraciones: `platform/0012_user_personal_photo.py` y
  `settings_runtime/0006_uho_fields.py` (ambas additivas).
