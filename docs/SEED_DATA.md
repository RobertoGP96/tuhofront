# Datos de prueba (`seed_demo`)

El comando `python manage.py seed_demo` carga datos consistentes para probar todos los flujos del sistema sin tener que crearlos a mano.

## Ejecutar

```bash
cd backend
source venv/bin/activate      # Linux/macOS
# venv\Scripts\activate       # Windows

python manage.py seed_demo            # cargar (idempotente, no duplica)
python manage.py seed_demo --reset    # borrar los datos de demo previos y recargar
```

El comando es seguro: cada usuario / departamento / local se actualiza si ya existe, no se duplica.

---

## Lo que crea

### Usuarios

Todos activos, con email verificado. Diseñados para que puedas probar cada rol del sistema sin hacer permutaciones manuales:

| Usuario | Contraseña | `user_type` | `is_staff` | `is_superuser` | Nombre completo |
|---|---|---|---|---|---|
| `admin` | `Admin12345` | ADMIN | ✅ | ✅ | Roberto Almeida |
| `gestor_int` | `Demo12345` | GESTOR_INTERNO | ✅ | ❌ | Ana Díaz |
| `gestor_sec` | `Demo12345` | GESTOR_SECRETARIA | ✅ | ❌ | Luis Hernández |
| `gestor_res` | `Demo12345` | GESTOR_RESERVAS | ✅ | ❌ | Elena Ramos |
| `usuario` | `Demo12345` | USUARIO | ❌ | ❌ | Juan Martínez |
| `usuario.amaya` … `usuario.pedro` | `Demo12345` | USUARIO | ❌ | ❌ | (variantes para volumen) |

### Departamentos y Áreas

Todos prefijados con `Demo ` para identificarlos fácilmente y poder borrarlos con `--reset`:

- **Demo Facultad de Informática** → Demo Ingeniería Informática, Demo Ciencias de la Computación
- **Demo Facultad de Ingeniería** → Demo Ingeniería Civil, Demo Ingeniería Eléctrica
- **Demo Vicerrectoría Administrativa** → Demo Servicios Generales, Demo Mantenimiento

### Noticias

3 noticias publicadas y vigentes (slug prefijado con `demo-`):

- `demo-bienvenida-tuho` — General, destacada.
- `demo-convocatoria-investigacion` — Investigación.
- `demo-mantenimiento-labs` — Administrativa.

### Locales (laboratorios y aulas)

| Código | Nombre | Tipo | Capacidad | Requiere aprobación |
|---|---|---|---|---|
| `LAB-01` | Laboratorio de Cómputo 1 | LABORATORIO | 30 | ✅ |
| `LAB-02` | Laboratorio de Cómputo 2 | LABORATORIO | 30 | ✅ |
| `AULA-101` | Aula 101 | AULA | 50 | ❌ |
| `AUDI-A` | Auditorio Principal | AUDITORIO | 200 | ✅ |
| `SALA-R1` | Sala de Reuniones 1 | SALA_REUNIONES | 12 | ✅ |

### Reservas

Creadas por varios `usuario.*`:

1. **Pendiente** en `LAB-01` — dentro de 2 días, 9:00–11:00, 25 asistentes.
2. **Aprobada** en `AUDI-A` — dentro de 4 días, 14:00–17:00, 120 asistentes, aprobada por `admin` o `gestor_res`.

### Catálogos internos

- **Tipos de transporte**: Traslado interno · Viaje provincial · Viaje nacional.
- **Tipos de mantenimiento**: Eléctrico · Plomería · Climatización · Computación.
- **Prioridades**: Baja · Media · Alta · Urgente.

### Trámites internos (uno de cada tipo, todos en estado `BORRADOR`)

| Tipo | Solicitante | Detalle |
|---|---|---|
| `FeedingProcedure` | usuario.carlos | Almuerzo restaurante, 5 personas, 3–5 días desde hoy |
| `AccommodationProcedure` | usuario.carlos | Hotelito posgrado, 7–10 días desde hoy |
| `TransportProcedure` | usuario.carlos | Viaje ida y vuelta, 12 pasajeros, en 5 días |
| `MaintanceProcedure` | usuario.maria | Aire del LAB-01 no enfría, prioridad Media |

---

## Cómo probar cada flujo

| Flujo | Usuario | Página | Qué deberías ver |
|---|---|---|---|
| Login + dashboard admin | `admin` | `/admin` | Estadísticas con datos reales (procedures count, users count) |
| Aprobar reserva pendiente | `admin` o `gestor_res` | `/admin/locals` o `/gestor-reservas` | La reserva del LAB-01 aparece en pendientes |
| Crear trámite interno | `usuario.carlos` | `/procedures/internal/feeding` | Formulario funcional con departamentos en el selector |
| Crear mantenimiento | `usuario.maria` | `/procedures/internal/maintenance` | Selectores de Tipo y Prioridad cargados |
| Ver mis trámites | `usuario.carlos` | `/procedures/internals` | 3 trámites en BORRADOR |
| Secretaría docente | `gestor_sec` | `/secretary` | Panel con lista (vacía) — podés crear nuevos |
| Tracking público | (sin login) | `/tracking` | Pegar `follow_number` + carnet de una reserva |
| Noticias públicas | (sin login) | `/news` | 3 noticias de demo |
| API directa | — | http://localhost:8000/api/docs/ | Probar `/auth/login/` con `admin`/`Admin12345` |

---

## Personalizar el seed

El comando vive en [backend/apps/platform/management/commands/seed_demo.py](../backend/apps/platform/management/commands/seed_demo.py). Es un único archivo, fácil de leer y modificar:

- Para añadir más usuarios, editá la lista `DEMO_USERS` al inicio.
- Para más locales, modificá `_seed_locals_and_reservation`.
- Para datos específicos por entorno, considerá clonar el comando como `seed_staging.py` o agregar flags `--users-only`, `--no-procedures`, etc.

---

## Limpiar / reiniciar la base completa

Si querés volver al estado vacío total (no solo borrar los datos de demo):

```bash
# Opción 1: borrar la base SQLite y volver a migrar
rm backend/db.sqlite3
python manage.py migrate
python manage.py seed_demo

# Opción 2: PostgreSQL — drop + create + migrate
dropdb tuho_db && createdb tuho_db
python manage.py migrate
python manage.py seed_demo
```

> Las contraseñas están en **plaintext** sólo en este documento y en el código del seed porque es exclusivamente para entornos de demo/desarrollo. **Nunca** uses estas credenciales en producción.
