"""
Comando de seed para entornos de desarrollo / demo.

Carga un set de datos realista de la Universidad de Holguín (UHO):

- ~16 usuarios cubriendo los 9 user_type con nombres cubanos verosímiles,
  carnets con fecha de nacimiento coherente, teléfonos con prefijos cubanos
  válidos, direcciones reales de Holguín, dob y workplace poblados.
- 5 facultades / direcciones con sus áreas (estructura real de la UHO).
- ~12 noticias publicadas en las últimas semanas cubriendo las 8 categorías,
  con publication_date escalonado, summary, tags y body de varios párrafos.
- ~10 locales del campus (laboratorios, aulas, auditorio, biblioteca,
  gimnasio, cafetería) con descripciones y equipamiento.
- ~10 reservas en distintos estados del workflow (BORRADOR, PENDIENTE,
  APROBADA, RECHAZADA, CANCELADA, FINALIZADA) para validar UI y filtros.
- Catálogos completos de trámites internos y ~16 trámites de ejemplo
  (alimentación, alojamiento, transporte, mantenimiento) con estados
  variados y datos relacionales (FeedingDays, Guest).

Uso:
    python manage.py seed_demo
    python manage.py seed_demo --reset   # borra y vuelve a crear los datos

Credenciales: `admin` / `Admin12345`.  Resto de usuarios: `Demo12345`.
"""

from datetime import date, timedelta
from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone

from apps.platform.models import User, Department, Area, News


DEMO_PASSWORD = "Demo12345"
ADMIN_PASSWORD = "Admin12345"


# ----------------------------------------------------------------------
# Usuarios demo
# Tupla: (username, email, first_name, last_name, user_type, id_card,
#         phone, dob ISO, address, workplace)
#
# Restricciones aplicadas (validators.py):
#   - id_card: 11 dígitos. YYMMDD válido, edad 16-100 (current_year=2025).
#       year_suffix <= 30 ⇒ 2000+yy ; else ⇒ 1900+yy
#   - phone: 8 dígitos exactos, prefijo cubano válido (5*, 24*, 7*, …).
# ----------------------------------------------------------------------
DEMO_USERS = [
    # — 5 anclas de login (una por user_type) —
    ("admin", "admin@uho.edu.cu", "Roberto", "Almeida Vázquez", "ADMIN",
     "75031512345", "53281001", "1975-03-15",
     "Reparto Pueblo Nuevo, Calle 12 #245, Holguín",
     "Rectoría — Universidad de Holguín"),
    ("gestor_int", "ana.diaz@uho.edu.cu", "Ana Belkis", "Díaz Mendoza", "GESTOR_INTERNO",
     "80071712345", "53281007", "1980-07-17",
     "Reparto Hilda Torres, Calle 1ra #15, Holguín",
     "Dirección de Trámites Internos — UHO"),
    ("gestor_sec", "luis.hernandez@uho.edu.cu", "Luis Manuel", "Hernández Pupo", "GESTOR_SECRETARIA",
     "79122212345", "53281008", "1979-12-22",
     "Reparto Sanfield, Calle 4 #88, Holguín",
     "Secretaría Docente — Facultad de Informática y Matemática"),
    ("gestor_res", "elena.ramos@uho.edu.cu", "Elena", "Ramos Tamayo", "GESTOR_RESERVAS",
     "83092812345", "53281009", "1983-09-28",
     "Reparto El Llano, Calle B #34, Holguín",
     "Dirección de Locales y Reservas — UHO"),
    ("usuario", "juan.martinez@uho.edu.cu", "Juan Carlos", "Martínez Núñez", "USUARIO",
     "05050512345", "53281005", "2005-05-05",
     "Calle Maceo #312, Holguín",
     "3er año — Ingeniería Informática"),

    # — usuarios adicionales para listados con volumen (todos USUARIO) —
    ("usuario.amaya", "amaya.ortiz@uho.edu.cu", "Amaya", "Ortiz Batista", "USUARIO",
     "04031512345", "53282001", "2004-03-15",
     "Reparto Pedro Díaz Coello, Calle 6ta #21, Holguín",
     "4to año — Ciencias de la Computación"),
    ("usuario.dario", "dario.fonseca@uho.edu.cu", "Darío", "Fonseca Leyva", "USUARIO",
     "06011012345", "53282002", "2006-01-10",
     "Reparto Alcides Pino, Calle 9 #45, Holguín",
     "1er año — Ingeniería Civil"),
    ("usuario.laura", "laura.castillo@uho.edu.cu", "Laura Beatriz", "Castillo Pérez", "USUARIO",
     "03082212345", "53282003", "2003-08-22",
     "Reparto Harlem, Calle Frexes #117, Holguín",
     "5to año — Contabilidad y Finanzas"),
    ("usuario.delgado", "marta.delgado@uho.edu.cu", "Marta Isabel", "Delgado Aguilera", "USUARIO",
     "72050812345", "53282004", "1972-05-08",
     "Reparto Peralta, Calle 23 #190, Holguín",
     "Departamento de Matemática — Facultad de Informática"),
    ("usuario.fonseca", "ramon.fonseca@uho.edu.cu", "Ramón", "Fonseca Velázquez", "USUARIO",
     "68110512345", "53282005", "1968-11-05",
     "Reparto Bayado, Calle 14 #76, Holguín",
     "Departamento de Ingeniería Eléctrica"),
    ("usuario.suarez", "yusniel.suarez@uho.edu.cu", "Yusniel", "Suárez Cruz", "USUARIO",
     "88010312345", "53282006", "1988-01-03",
     "Reparto Aguilera, Calle 7ma #305, Holguín",
     "Mantenimiento — Vicerrectoría Administrativa"),
    ("usuario.raul", "raul.delgado@cipa.cu", "Raúl", "Delgado Tamayo", "USUARIO",
     "65072812345", "53282007", "1965-07-28",
     "Calle Coliseo #210, Holguín",
     "Centro Provincial de Investigación Aplicada"),
    ("usuario.lucia", "lucia.perez@uho.edu.cu", "Lucía", "Pérez Cabrera", "USUARIO",
     "82081012345", "53281002", "1982-08-10",
     "Reparto Vista Alegre, Calle 18 #112 e/ 5 y 7, Holguín",
     "Auxiliar — Secretaría Docente"),
    ("usuario.carlos", "carlos.rodriguez@uho.edu.cu", "Carlos", "Rodríguez Estrada", "USUARIO",
     "78112012345", "53281003", "1978-11-20",
     "Reparto Lenin, Edif. 21 Apto 304, Holguín",
     "Departamento de Ingeniería Informática"),
    ("usuario.maria", "maria.gonzalez@uho.edu.cu", "María Elena", "González Reyes", "USUARIO",
     "85042512345", "53281004", "1985-04-25",
     "Calle Mártires #56 e/ Frexes y Aguilera, Holguín",
     "Servicios Generales — Vicerrectoría Administrativa"),
    ("usuario.pedro", "pedro.suarez@geysel.cu", "Pedro Antonio", "Suárez Domínguez", "USUARIO",
     "70060312345", "53281006", "1970-06-03",
     "Avenida XX Aniversario #408, Holguín",
     "GEYSEL — Empresa de Servicios Informáticos"),
]


# Usernames de versiones anteriores del seed que deben ser purgados.
LEGACY_DEMO_USERNAMES = (
    "secretaria", "profesor", "trabajador", "estudiante", "externo",
    "gestor_tram", "estudiante.amaya", "estudiante.dario", "estudiante.laura",
    "profesor.delgado", "profesor.fonseca", "trabajador.suarez", "externo.delgado",
)


# ----------------------------------------------------------------------
# Estructura organizativa (Departamentos → Áreas)
# ----------------------------------------------------------------------
DEPARTMENT_STRUCTURE = {
    "Facultad de Informática y Matemática": [
        "Ingeniería Informática",
        "Ciencias de la Computación",
        "Matemática",
    ],
    "Facultad de Ingeniería": [
        "Ingeniería Civil",
        "Ingeniería Eléctrica",
        "Ingeniería Industrial",
        "Ingeniería Mecánica",
    ],
    "Facultad de Ciencias Económicas y Administración": [
        "Contabilidad y Finanzas",
        "Economía",
        "Turismo",
    ],
    "Facultad de Humanidades": [
        "Estudios Socioculturales",
        "Comunicación Social",
        "Lenguas Extranjeras",
    ],
    "Vicerrectoría Administrativa": [
        "Servicios Generales",
        "Mantenimiento",
        "Transporte",
        "Recursos Humanos",
    ],
}


class Command(BaseCommand):
    help = "Carga datos de prueba realistas para desarrollo / demo."

    def add_arguments(self, parser):
        parser.add_argument(
            "--reset",
            action="store_true",
            help="Elimina los usuarios y catálogos de demo antes de cargarlos.",
        )

    @transaction.atomic
    def handle(self, *args, **opts):
        if opts["reset"]:
            self.stdout.write(self.style.WARNING("Eliminando datos de demo anteriores..."))
            self._reset_data()

        self.stdout.write(self.style.MIGRATE_HEADING("Sembrando datos de demo..."))

        users = self._seed_users()
        departments, areas = self._seed_departments_and_areas()
        self._seed_news(users["admin"])
        self._seed_locals_and_reservations(users)
        self._seed_internal_catalogs_and_procedures(users)

        self.stdout.write("")
        self.stdout.write(self.style.SUCCESS("Seed completado."))
        self.stdout.write("")
        self.stdout.write("Credenciales de acceso (todas activas y verificadas):")
        self.stdout.write(f"  admin       / {ADMIN_PASSWORD}   (Administrador, is_staff + is_superuser)")
        for username, _email, fn, ln, ut, *_rest in DEMO_USERS[1:]:
            self.stdout.write(f"  {username:<22} / {DEMO_PASSWORD}    ({ut}, {fn} {ln})")
        self.stdout.write("")
        self.stdout.write("Documentación de la API: http://localhost:8000/api/docs/")

    # ------------------------------------------------------------------ reset

    def _reset_data(self):
        from apps.labs.models import Local, LocalReservation
        from apps.internal.models import (
            FeedingProcedure, AccommodationProcedure,
            TransportProcedure, MaintanceProcedure,
            FeedingDays, Guest,
        )

        usernames = [u[0] for u in DEMO_USERS] + list(LEGACY_DEMO_USERNAMES)

        # Procedimientos vinculados a usuarios demo
        FeedingProcedure.objects.filter(user__username__in=usernames).delete()
        AccommodationProcedure.objects.filter(user__username__in=usernames).delete()
        TransportProcedure.objects.filter(user__username__in=usernames).delete()
        MaintanceProcedure.objects.filter(user__username__in=usernames).delete()
        LocalReservation.objects.filter(user__username__in=usernames).delete()

        # Datos auxiliares sin FK al user (se regeneran limpio)
        FeedingDays.objects.all().delete()
        Guest.objects.filter(identification__startswith="9").delete()  # carnets demo

        # Locales: tanto los nuevos códigos como los viejos
        Local.objects.filter(
            code__in=[c for c, *_ in LOCALS_DATA] + ["LAB-01", "LAB-02", "AULA-101", "AUDI-A", "SALA-R1"]
        ).delete()

        # Noticias: slugs canónicos + legacy con prefijo demo-
        News.objects.filter(slug__in=[n["slug"] for n in NEWS_ITEMS]).delete()
        News.objects.filter(slug__startswith="demo-").delete()

        # Departamentos: lista canónica + legacy con prefijo "Demo "
        Department.objects.filter(name__in=list(DEPARTMENT_STRUCTURE.keys())).delete()
        Department.objects.filter(name__startswith="Demo ").delete()

        # Usuarios al final (no se borran las FK ya borradas)
        User.objects.filter(username__in=usernames).delete()

    # ------------------------------------------------------------------ users

    def _seed_users(self):
        users = {}
        staff_roles = {
            "ADMIN",
            "GESTOR_INTERNO", "GESTOR_SECRETARIA", "GESTOR_RESERVAS",
        }

        for (username, email, fn, ln, ut, id_card, phone,
             dob_iso, address, workplace) in DEMO_USERS:
            is_admin = username == "admin"
            password = ADMIN_PASSWORD if is_admin else DEMO_PASSWORD
            is_staff = is_admin or (ut in staff_roles)
            dob = date.fromisoformat(dob_iso)

            fields = dict(
                email=email,
                first_name=fn,
                last_name=ln,
                user_type=ut,
                id_card=id_card,
                phone=phone,
                address=address,
                date_of_birth=dob,
                workplace=workplace,
                is_active=True,
                email_verified=True,
                phone_verified=True,
                is_staff=is_staff,
                is_superuser=is_admin,
            )

            existing = User.objects.filter(username=username).first()
            if existing is None:
                user = User(username=username, **fields)
                user.set_password(password)
                user.save()
                verb = "Creado"
            else:
                for k, v in fields.items():
                    setattr(existing, k, v)
                existing.set_password(password)
                existing.save()
                user = existing
                verb = "Actualizado"

            users[username] = user
            self.stdout.write(f"  {verb} usuario: {username} ({ut})")

        return users

    # ----------------------------------------------------------- departments

    def _seed_departments_and_areas(self):
        departments = {}
        areas = {}
        for dep_name, area_names in DEPARTMENT_STRUCTURE.items():
            dep, _ = Department.objects.get_or_create(name=dep_name)
            departments[dep_name] = dep
            for area_name in area_names:
                area, _ = Area.objects.get_or_create(name=area_name, department=dep)
                areas[area_name] = area
        self.stdout.write(
            f"  Departamentos: {len(departments)} / Áreas: {len(areas)}"
        )
        return departments, areas

    # ----------------------------------------------------------------- news

    def _seed_news(self, admin_user):
        now = timezone.now()
        for item in NEWS_ITEMS:
            days_ago = item.get("_days_ago", 0)
            payload = {k: v for k, v in item.items() if k != "_days_ago"}
            News.objects.update_or_create(
                slug=item["slug"],
                defaults={
                    **payload,
                    "author": admin_user,
                    "publication_date": now - timedelta(days=days_ago),
                },
            )
        self.stdout.write(f"  Noticias publicadas: {len(NEWS_ITEMS)}")

    # ----------------------------------------------------------------- labs

    def _seed_locals_and_reservations(self, users):
        from apps.labs.models import Local, LocalReservation
        from apps.labs.enums import (
            LocalTypeEnum, ReservationStateEnum, ReservationPurposeEnum,
        )

        # Locales
        locals_obj = {}
        for code, name, ltype, cap, approval, desc in LOCALS_DATA:
            obj, _ = Local.objects.get_or_create(
                code=code,
                defaults={
                    "name": name,
                    "local_type": ltype,
                    "capacity": cap,
                    "description": desc,
                    "is_active": True,
                    "requires_approval": approval,
                },
            )
            locals_obj[code] = obj
        self.stdout.write(f"  Locales: {len(locals_obj)}")

        # Reservas — cubrimos BORRADOR / PENDIENTE / APROBADA / RECHAZADA /
        # CANCELADA / FINALIZADA. Usamos create directo (no clean()) para
        # poder seedear fechas pasadas (clean() bloquea start_time<=now en
        # objetos nuevos).
        now = timezone.now()

        def _ts(days_offset, hour, minute=0):
            base = (now + timedelta(days=days_offset)).replace(
                hour=hour, minute=minute, second=0, microsecond=0,
            )
            return base

        reservations = [
            # (local_code, user, start_offset_days, start_hour, duration_h,
            #  purpose, purpose_detail, attendees, state, extras_dict)
            ("LAB-INF-01", users["usuario"], 1, 14, 2,
             ReservationPurposeEnum.ESTUDIO,
             "Sesión de estudio grupal para preparar examen final de Programación I.",
             18, ReservationStateEnum.BORRADOR, {}),

            ("LAB-INF-02", users["usuario.carlos"], 2, 9, 2,
             ReservationPurposeEnum.CLASE,
             "Clase práctica de Bases de Datos. Se trabajará con PostgreSQL "
             "y se requiere acceso a internet para descargar datasets.",
             25, ReservationStateEnum.PENDIENTE, {}),

            ("AULA-201", users["usuario.delgado"], 3, 10, 2,
             ReservationPurposeEnum.EXAMEN,
             "Examen final de Matemática Discreta para el grupo Inf-2A.",
             40, ReservationStateEnum.PENDIENTE, {}),

            ("AUDI-MARTI", users["usuario.carlos"], 5, 14, 3,
             ReservationPurposeEnum.CONFERENCIA,
             "Conferencia 'Inteligencia Artificial aplicada a la educación' "
             "con ponentes invitados de la Universidad de La Habana.",
             180, ReservationStateEnum.APROBADA,
             {"approved_by": users["gestor_res"], "approved_at": now - timedelta(days=2)}),

            ("SALA-RECT-01", users["usuario.lucia"], 4, 9, 1,
             ReservationPurposeEnum.REUNION,
             "Reunión semanal del Consejo de Dirección de la Facultad de Informática.",
             10, ReservationStateEnum.APROBADA,
             {"approved_by": users["admin"], "approved_at": now - timedelta(days=1)}),

            ("LAB-INF-01", users["usuario.amaya"], 6, 15, 2,
             ReservationPurposeEnum.TALLER,
             "Taller de introducción a Git y GitHub para estudiantes de 1er año.",
             24, ReservationStateEnum.APROBADA,
             {"approved_by": users["gestor_res"], "approved_at": now - timedelta(hours=6)}),

            ("AUDI-MARTI", users["usuario.pedro"], 8, 9, 4,
             ReservationPurposeEnum.EVENTO,
             "Feria de empleo de empresas IT de Holguín. Requiere proyector "
             "y pantalla central.",
             150, ReservationStateEnum.RECHAZADA,
             {"rejection_reason": "Coincide con el acto de graduación previsto "
                                  "para esa fecha. Sugerimos reprogramar para "
                                  "la siguiente semana."}),

            ("LAB-FIS-01", users["usuario.fonseca"], 7, 14, 2,
             ReservationPurposeEnum.CLASE,
             "Práctica de laboratorio de Circuitos Eléctricos.",
             20, ReservationStateEnum.CANCELADA,
             {"cancellation_reason": "El profesor está de licencia médica esa semana."}),

            # — Reservas pasadas (FINALIZADA) —
            ("AULA-201", users["usuario.carlos"], -10, 9, 2,
             ReservationPurposeEnum.CLASE,
             "Clase magistral de Estructuras de Datos para 2do año.",
             35, ReservationStateEnum.FINALIZADA,
             {"approved_by": users["gestor_res"], "approved_at": now - timedelta(days=14)}),

            ("AUDI-MARTI", users["admin"], -21, 10, 3,
             ReservationPurposeEnum.EVENTO,
             "Acto académico por el aniversario de la Universidad de Holguín.",
             170, ReservationStateEnum.FINALIZADA,
             {"approved_by": users["admin"], "approved_at": now - timedelta(days=25)}),
        ]

        for (code, user, off, hr, dur, purpose, detail, att, state, extras) in reservations:
            local = locals_obj[code]
            start = _ts(off, hr)
            end = start + timedelta(hours=dur)
            defaults = {
                "user": user,
                "end_time": end,
                "purpose": purpose,
                "purpose_detail": detail,
                "expected_attendees": min(att, local.capacity),
                "responsible_name": user.get_full_name() or user.username,
                "responsible_phone": user.phone or "53281000",
                "responsible_email": user.email,
                "state": state,
                **extras,
            }
            LocalReservation.objects.get_or_create(
                local=local,
                start_time=start,
                defaults=defaults,
            )

        states_seeded = sorted({r[8] for r in reservations})
        self.stdout.write(
            f"  Reservas: {len(reservations)} (estados: {', '.join(states_seeded)})"
        )

    # ------------------------------------------------------- internal catalogs

    def _seed_internal_catalogs_and_procedures(self, users):
        from apps.internal.models import (
            TransportProcedureType,
            MaintanceProcedureType,
            MaintancePriority,
            FeedingProcedure,
            FeedingDays,
            AccommodationProcedure,
            Guest,
            TransportProcedure,
            MaintanceProcedure,
        )
        from apps.platform.models.procedure import ProcedureStateEnum

        # --- catálogos ---
        transport_types = [
            "Traslado interno",
            "Viaje provincial",
            "Viaje nacional",
            "Recogida de personal",
            "Viaje a evento académico",
        ]
        for n in transport_types:
            TransportProcedureType.objects.get_or_create(name=n)

        maint_types = ["Eléctrico", "Plomería", "Climatización", "Computación", "Carpintería"]
        for n in maint_types:
            MaintanceProcedureType.objects.get_or_create(name=n)

        priorities = ["Baja", "Media", "Alta", "Urgente"]
        for n in priorities:
            MaintancePriority.objects.get_or_create(name=n)

        self.stdout.write(
            f"  Catálogos internos: transport_types={len(transport_types)} "
            f"maint_types={len(maint_types)} priorities={len(priorities)}"
        )

        today = timezone.now().date()
        now = timezone.now()

        # --- FeedingProcedure (5) ---
        feeding_specs = [
            (users["usuario.carlos"], "RESTAURANT", 3, 5,
             "Almuerzo para visita de evaluadores externos del programa de Maestría.",
             8, ProcedureStateEnum.APROBADO,
             [(3, 0, 8, 0, 0), (4, 0, 8, 0, 0), (5, 0, 8, 0, 0)]),
            (users["usuario.lucia"], "HOTELITO", 10, 12,
             "Servicio de alimentación completa para conferencistas del Congreso de Educación.",
             6, ProcedureStateEnum.EN_PROCESO,
             [(10, 6, 6, 6, 0), (11, 6, 6, 6, 6), (12, 6, 6, 6, 0)]),
            (users["gestor_int"], "RESTAURANT", 1, 1,
             "Coffee break para reunión del Consejo de Dirección (15 personas).",
             15, ProcedureStateEnum.APROBADO, []),
            (users["usuario.delgado"], "HOTELITO", -7, -5,
             "Alimentación para evaluadores del Tribunal de Defensa de Tesis.",
             4, ProcedureStateEnum.FINALIZADO, []),
            (users["usuario.pedro"], "RESTAURANT", 15, 15,
             "Cena protocolar tras la firma del convenio con GEYSEL.",
             12, ProcedureStateEnum.BORRADOR, []),
        ]
        for user, ftype, start_off, end_off, desc, amount, state, days_spec in feeding_specs:
            fp, created = FeedingProcedure.objects.get_or_create(
                user=user,
                description=desc,
                defaults={
                    "feeding_type": ftype,
                    "start_day": today + timedelta(days=start_off),
                    "end_day": today + timedelta(days=end_off),
                    "amount": amount,
                    "state": state,
                },
            )
            if created and days_spec:
                for d_off, br, lu, di, sn in days_spec:
                    fd, _ = FeedingDays.objects.get_or_create(
                        date=today + timedelta(days=d_off),
                        defaults={"breakfast": br, "lunch": lu, "dinner": di, "snack": sn},
                    )
                    fp.feeding_days.add(fd)

        # --- AccommodationProcedure (3) con Guests ---
        # Guests usan carnets demo con prefijo '9' para poder limpiarlos en --reset.
        guests_data = [
            ("Dr. Andrés Beltrán Cardozo", "M", "97031512345"),
            ("Dra. Isabel Cárdenas Roque", "F", "97082212345"),
            ("MSc. Jorge Pino Acosta", "M", "97120512345"),
            ("Dra. Marlene Sosa Báez", "F", "97052812345"),
        ]
        guest_objs = []
        for name, sex, ident in guests_data:
            g, _ = Guest.objects.get_or_create(
                identification=ident,
                defaults={"name": name, "sex": sex},
            )
            guest_objs.append(g)

        accommodation_specs = [
            (users["usuario.carlos"], "POSGRADO", 7, 10,
             "Alojamiento para conferencista invitado del Congreso de IA.",
             ProcedureStateEnum.APROBADO, guest_objs[:1]),
            (users["usuario.lucia"], "HOTEL", 14, 17,
             "Alojamiento para tribunal evaluador del programa de Doctorado.",
             ProcedureStateEnum.EN_PROCESO, guest_objs[1:3]),
            (users["gestor_int"], "POSGRADO", -15, -12,
             "Alojamiento para visita técnica del MES.",
             ProcedureStateEnum.FINALIZADO, guest_objs[3:4]),
        ]
        for user, atype, start_off, end_off, desc, state, guests in accommodation_specs:
            ap, created = AccommodationProcedure.objects.get_or_create(
                user=user,
                description=desc,
                defaults={
                    "accommodation_type": atype,
                    "start_day": today + timedelta(days=start_off),
                    "end_day": today + timedelta(days=end_off),
                    "state": state,
                },
            )
            if created:
                for g in guests:
                    ap.guests.add(g)

        # --- TransportProcedure (4) ---
        tt = {t.name: t for t in TransportProcedureType.objects.all()}
        transport_specs = [
            (users["usuario.carlos"], tt["Viaje provincial"], 5, 8, 18,
             "Sede central UHO", "Hotel Pernik, Holguín",
             "Traslado de delegación al Encuentro Provincial de Investigadores.",
             "P234567", True, 12, ProcedureStateEnum.APROBADO),
            (users["gestor_int"], tt["Viaje nacional"], 12, 8, 20,
             "Sede central UHO", "Ministerio de Educación Superior, La Habana",
             "Viaje a reunión nacional de directores administrativos.",
             None, True, 4, ProcedureStateEnum.EN_PROCESO),
            (users["usuario.lucia"], tt["Traslado interno"], 2, 9, 11,
             "Sede central UHO", "Sede Celia Sánchez, Holguín",
             "Traslado de documentación entre sedes universitarias.",
             "T118293", True, 2, ProcedureStateEnum.APROBADO),
            (users["usuario.pedro"], tt["Viaje a evento académico"], -20, 7, 19,
             "Sede central UHO", "Universidad de Oriente, Santiago de Cuba",
             "Asistencia al Simposio Cubano de Ciencias Computacionales.",
             "P987654", True, 8, ProcedureStateEnum.FINALIZADO),
        ]
        for (user, ptype, day_off, h_dep, h_ret, dep_place, ret_place,
             desc, plate, round_trip, passengers, state) in transport_specs:
            departure = (now + timedelta(days=day_off)).replace(
                hour=h_dep, minute=0, second=0, microsecond=0)
            ret = departure.replace(hour=h_ret) if h_ret > h_dep else \
                  departure + timedelta(hours=(h_ret - h_dep) % 24 or 1)
            TransportProcedure.objects.get_or_create(
                user=user,
                description=desc,
                defaults={
                    "procedure_type": ptype,
                    "departure_time": departure,
                    "return_time": ret,
                    "departure_place": dep_place,
                    "return_place": ret_place,
                    "passengers": passengers,
                    "plate": plate,
                    "round_trip": round_trip,
                    "state": state,
                },
            )

        # --- MaintanceProcedure (4) ---
        mt = {m.name: m for m in MaintanceProcedureType.objects.all()}
        prio = {p.name: p for p in MaintancePriority.objects.all()}
        maint_specs = [
            (users["usuario.maria"], mt["Climatización"], prio["Alta"],
             "Aire acondicionado del laboratorio LAB-INF-01 no enfría correctamente. "
             "Filtros saturados y aparente fuga de refrigerante. Impacta clases programadas.",
             ProcedureStateEnum.EN_PROCESO),
            (users["usuario.carlos"], mt["Computación"], prio["Urgente"],
             "El servidor de respaldo del laboratorio de Bases de Datos presenta "
             "errores de disco. Se requiere diagnóstico y eventual reemplazo del HDD.",
             ProcedureStateEnum.APROBADO),
            (users["usuario.suarez"], mt["Plomería"], prio["Media"],
             "Filtración de agua en el baño de la planta baja, pasillo de aulas 200.",
             ProcedureStateEnum.ENVIADO),
            (users["usuario.lucia"], mt["Eléctrico"], prio["Baja"],
             "Bombillo fundido en la oficina de Secretaría. Solicitar reposición.",
             ProcedureStateEnum.FINALIZADO),
        ]
        for user, ptype, priority, desc, state in maint_specs:
            MaintanceProcedure.objects.get_or_create(
                user=user,
                description=desc,
                defaults={
                    "procedure_type": ptype,
                    "priority": priority,
                    "state": state,
                },
            )

        self.stdout.write(
            "  Trámites internos: "
            f"feeding={len(feeding_specs)} accommodation={len(accommodation_specs)} "
            f"transport={len(transport_specs)} maintenance={len(maint_specs)}"
        )


# ============================================================================
# Datos estáticos: noticias y locales
# ============================================================================

NEWS_ITEMS = [
    {
        "slug": "bienvenida-curso-2026",
        "title": "Bienvenida al curso académico 2026 en la Universidad de Holguín",
        "category": "GENERAL",
        "summary": "La UHO da la bienvenida a más de 12,000 estudiantes en el inicio del curso 2026, "
                   "con renovaciones de infraestructura y nuevos programas académicos.",
        "body": (
            "La Universidad de Holguín da inicio oficial al curso académico 2026 con una "
            "matrícula que supera los 12,000 estudiantes distribuidos entre las cinco "
            "facultades y los centros universitarios municipales.\n\n"
            "Durante el receso, las áreas de Servicios Generales y Mantenimiento ejecutaron "
            "trabajos de pintura, sustitución de luminarias LED y mejoras en los laboratorios "
            "de cómputo de la Facultad de Informática y Matemática.\n\n"
            "El acto inaugural se realizó en el Auditorio José Martí, con la presencia del "
            "Rector y representantes del Ministerio de Educación Superior. Se reconoció a los "
            "estudiantes de mayor aprovechamiento del curso anterior y se presentaron los "
            "nuevos programas de Maestría aprobados por la Junta de Acreditación Nacional."
        ),
        "tags": "curso 2026, inicio, bienvenida, matrícula",
        "is_published": True,
        "featured": True,
        "_days_ago": 35,
    },
    {
        "slug": "convocatoria-investigacion-2026",
        "title": "Abierta la convocatoria de proyectos de investigación 2026",
        "category": "RESEARCH",
        "summary": "Profesores e investigadores pueden presentar propuestas hasta el 30 de junio para "
                   "el programa nacional de proyectos sectoriales.",
        "body": (
            "La Dirección de Ciencia e Innovación informa que se encuentra abierta la "
            "convocatoria 2026 para proyectos de investigación bajo el programa nacional "
            "y los programas sectoriales del MES, CITMA y MINSAP.\n\n"
            "Las líneas priorizadas en esta convocatoria incluyen: ciencia de datos aplicada "
            "a la salud pública, energías renovables, gestión del turismo sostenible, "
            "estudios socioculturales del territorio holguinero y modelación matemática "
            "aplicada a sistemas productivos.\n\n"
            "Las propuestas deben presentarse por la plataforma SIGEP-UHO antes del 30 de junio. "
            "Cada proyecto requiere un coordinador principal con grado de Doctor o Máster, "
            "un cronograma de tres años y un presupuesto detallado."
        ),
        "tags": "investigación, convocatoria, MES, CITMA, ciencia",
        "is_published": True,
        "featured": True,
        "_days_ago": 28,
    },
    {
        "slug": "mantenimiento-laboratorios-mayo",
        "title": "Cronograma de mantenimiento de laboratorios de cómputo",
        "category": "MANAGEMENT",
        "summary": "Los laboratorios LAB-INF-01 y LAB-INF-02 estarán cerrados temporalmente para "
                   "actualización de equipos y reinstalación de sistemas.",
        "body": (
            "La Vicerrectoría Administrativa informa que durante la próxima semana se "
            "realizarán trabajos de mantenimiento mayor en los laboratorios LAB-INF-01 y "
            "LAB-INF-02 de la Facultad de Informática.\n\n"
            "Las labores incluyen sustitución de fuentes de alimentación, reinstalación "
            "de Ubuntu 22.04 LTS, actualización de las herramientas docentes "
            "(PostgreSQL 16, Node.js 20, Python 3.11) y revisión del cableado estructurado.\n\n"
            "Las clases programadas en estos locales serán reubicadas en AULA-201 y "
            "AULA-202. Los profesores deben verificar el horario actualizado en el sistema "
            "TUho antes del lunes próximo."
        ),
        "tags": "mantenimiento, laboratorios, infraestructura",
        "is_published": True,
        "_days_ago": 14,
    },
    {
        "slug": "jornada-cientifica-estudiantil",
        "title": "Jornada Científica Estudiantil 2026: inscripciones abiertas",
        "category": "STUDENT",
        "summary": "Estudiantes de pregrado pueden presentar trabajos en 12 comisiones temáticas "
                   "hasta el 15 de junio.",
        "body": (
            "La Federación Estudiantil Universitaria (FEU) y la Dirección de Investigaciones "
            "convocan a la XXX Jornada Científica Estudiantil, a celebrarse del 18 al 20 de junio "
            "en las instalaciones de la sede central.\n\n"
            "Las comisiones temáticas abarcan Ingeniería Informática, Ciencias Económicas, "
            "Ingenierías, Humanidades, Educación, Cultura Física, Ciencias Naturales y "
            "Estudios Socioculturales.\n\n"
            "Los trabajos se presentan en formato de ponencia oral (15 min) o póster científico. "
            "Las inscripciones se realizan a través de la sección 'Jornada' del sistema TUho, "
            "con resumen de hasta 300 palabras y tutor avalando."
        ),
        "tags": "jornada científica, estudiantes, FEU, ponencias",
        "is_published": True,
        "_days_ago": 21,
    },
    {
        "slug": "convenio-geysel-uho",
        "title": "Firmado convenio de colaboración UHO–GEYSEL",
        "category": "ACADEMIC",
        "summary": "El acuerdo prevé prácticas laborales, proyectos conjuntos y becas para "
                   "estudiantes de Ingeniería Informática.",
        "body": (
            "Las autoridades de la Universidad de Holguín y la Empresa de Servicios "
            "Informáticos GEYSEL firmaron un convenio de colaboración de cinco años de "
            "vigencia que contempla múltiples líneas de trabajo conjunto.\n\n"
            "El acuerdo establece programas de prácticas laborales en GEYSEL para "
            "estudiantes de 3er, 4to y 5to año de Ingeniería Informática y Ciencias de la "
            "Computación, así como la cofinanciación de proyectos de tesis vinculados a "
            "necesidades reales de la empresa.\n\n"
            "Adicionalmente, GEYSEL aportará becas de estudio para estudiantes de alto "
            "aprovechamiento académico y participará en la conformación de tribunales "
            "evaluadores de defensas de diploma."
        ),
        "tags": "convenio, GEYSEL, prácticas, becas",
        "is_published": True,
        "_days_ago": 7,
    },
    {
        "slug": "festival-artistico-fame-2026",
        "title": "Festival Artístico FAME 2026: tu universidad, tu talento",
        "category": "CULTURAL",
        "summary": "Hasta el 10 de julio los estudiantes pueden inscribirse en las manifestaciones "
                   "de música, danza, teatro, artes plásticas y literatura.",
        "body": (
            "El Departamento de Extensión Universitaria convoca a la edición 2026 del "
            "Festival de Artistas Aficionados (FAME), espacio que durante más de tres décadas "
            "ha promovido el talento artístico estudiantil en la Universidad de Holguín.\n\n"
            "Las manifestaciones convocadas son: música (solistas, dúos, tríos, agrupaciones), "
            "danza (folclórica, contemporánea, popular), teatro, artes plásticas, narración oral, "
            "poesía y literatura.\n\n"
            "Las inscripciones se realizan en las Direcciones de Extensión de cada facultad "
            "antes del 10 de julio. Las eliminatorias serán por facultad y la gala final "
            "del festival se celebrará en el Auditorio José Martí."
        ),
        "tags": "FAME, cultura, festival, artes",
        "is_published": True,
        "_days_ago": 4,
    },
    {
        "slug": "copa-deportes-interfacultades",
        "title": "Comienza la Copa Universitaria Interfacultades de Deportes",
        "category": "SPORTS",
        "summary": "Cinco facultades compiten en fútbol, baloncesto, voleibol, atletismo y ajedrez "
                   "durante todo el mes.",
        "body": (
            "La Cátedra de Educación Física y Deportes da inicio a la edición 2026 de la Copa "
            "Universitaria Interfacultades, que reúne a equipos representativos de las cinco "
            "facultades de la UHO.\n\n"
            "Las disciplinas en competencia son fútbol (masculino y femenino), baloncesto, "
            "voleibol, atletismo y ajedrez. Las jornadas se desarrollarán en el gimnasio "
            "central y la pista deportiva de la sede principal.\n\n"
            "El calendario completo y las planillas con los resultados parciales pueden "
            "consultarse en la cartelera digital del Departamento de Cultura Física, "
            "actualizada al cierre de cada jornada."
        ),
        "tags": "deportes, copa interfacultades, FEU",
        "is_published": True,
        "_days_ago": 10,
    },
    {
        "slug": "extension-comunidad-pueblo-nuevo",
        "title": "Proyecto de extensión comunitaria en Pueblo Nuevo",
        "category": "EXTENSION",
        "summary": "Estudiantes y profesores acompañan a familias del consejo popular en "
                   "alfabetización digital y orientación vocacional.",
        "body": (
            "El proyecto de extensión 'Universidad en mi barrio', coordinado por la Facultad "
            "de Humanidades en conjunto con la Facultad de Informática, llega a su segundo "
            "año de implementación en el consejo popular Pueblo Nuevo.\n\n"
            "Las actividades incluyen talleres de alfabetización digital para adultos "
            "mayores, encuentros de orientación vocacional con estudiantes de pre-universitario "
            "y atención psicopedagógica a familias en situación de vulnerabilidad.\n\n"
            "Hasta la fecha han participado más de 60 estudiantes de las carreras de "
            "Estudios Socioculturales, Comunicación Social e Ingeniería Informática, "
            "beneficiando a 145 familias del territorio."
        ),
        "tags": "extensión, comunidad, Pueblo Nuevo, alfabetización digital",
        "is_published": True,
        "_days_ago": 18,
    },
    {
        "slug": "doctorado-honoris-causa-2026",
        "title": "La UHO otorgará Doctorado Honoris Causa en ceremonia académica",
        "category": "ACADEMIC",
        "summary": "Reconocimiento al destacado investigador en ciencias de la educación por "
                   "su aporte sostenido a la pedagogía cubana.",
        "body": (
            "El Consejo Universitario de la UHO aprobó el otorgamiento del título de Doctor "
            "Honoris Causa a un destacado investigador en ciencias de la educación con más "
            "de cuarenta años de trayectoria en la pedagogía cubana.\n\n"
            "La ceremonia académica se realizará el próximo mes en el Auditorio José Martí, "
            "con la presencia de autoridades universitarias nacionales, representantes del "
            "MES y la comunidad académica de Holguín.\n\n"
            "Este es el séptimo Doctorado Honoris Causa otorgado por la Universidad de "
            "Holguín desde su fundación."
        ),
        "tags": "honoris causa, doctorado, reconocimiento",
        "is_published": True,
        "featured": True,
        "_days_ago": 2,
    },
    {
        "slug": "becas-movilidad-internacional",
        "title": "Becas de movilidad internacional para profesores y doctorandos",
        "category": "ACADEMIC",
        "summary": "Convocatoria abierta para estancias de investigación en universidades "
                   "iberoamericanas durante el segundo semestre.",
        "body": (
            "La Dirección de Relaciones Internacionales informa la apertura de la "
            "convocatoria 2026 de becas de movilidad para profesores, investigadores y "
            "estudiantes de doctorado de la UHO.\n\n"
            "Los destinos disponibles esta edición incluyen universidades de México, "
            "Colombia, Argentina, España y Brasil, con estancias entre uno y seis meses, "
            "según el programa.\n\n"
            "Los interesados deben presentar plan de trabajo avalado por su departamento, "
            "currículo actualizado y carta de aceptación preliminar de la institución de "
            "destino. La convocatoria cierra el 25 de junio."
        ),
        "tags": "movilidad, becas, internacionalización, doctorandos",
        "is_published": True,
        "_days_ago": 12,
    },
    {
        "slug": "campania-vacunacion-comunidad",
        "title": "Campaña de vacunación en la comunidad universitaria",
        "category": "GENERAL",
        "summary": "Servicios médicos coordinan jornadas de vacunación antigripal y refuerzos "
                   "para trabajadores y estudiantes.",
        "body": (
            "El Departamento de Servicios Médicos de la UHO, en coordinación con el Policlínico "
            "Pedro Díaz Coello, desarrollará durante la próxima semana una jornada de vacunación "
            "antigripal y de refuerzo destinada a la comunidad universitaria.\n\n"
            "Las jornadas se realizarán en el área de Servicios Médicos de la sede central "
            "en horario de 8:00 am a 4:00 pm. Los trabajadores y estudiantes solo deben "
            "presentar su tarjeta de identidad universitaria.\n\n"
            "Se priorizará a las personas mayores de 60 años, embarazadas y trabajadores "
            "con enfermedades crónicas. El servicio es gratuito y voluntario."
        ),
        "tags": "salud, vacunación, servicios médicos",
        "is_published": True,
        "_days_ago": 25,
    },
    {
        "slug": "premio-relevante-fcom-cuba",
        "title": "Premio Relevante en el FORUM de Ciencia y Técnica a investigadora de la UHO",
        "category": "RESEARCH",
        "summary": "El trabajo sobre modelación matemática aplicada a la gestión hídrica de "
                   "Holguín obtuvo el máximo galardón provincial.",
        "body": (
            "Una investigadora del Departamento de Matemática de la Facultad de Informática "
            "y Matemática obtuvo el Premio Relevante en el FORUM provincial de Ciencia y Técnica "
            "con el trabajo 'Modelo predictivo del comportamiento hídrico de las cuencas "
            "subterráneas del municipio Holguín'.\n\n"
            "El estudio, fruto de tres años de trabajo conjunto con la Empresa de Acueducto y "
            "Alcantarillado, propone un sistema de alertas tempranas ante sequías prolongadas "
            "basado en redes neuronales y datos satelitales.\n\n"
            "El trabajo pasa ahora a la fase nacional del FORUM, que se celebrará en La Habana "
            "el próximo trimestre."
        ),
        "tags": "FORUM, premio, matemática, gestión hídrica",
        "is_published": True,
        "_days_ago": 40,
    },
]


# (code, name, local_type, capacity, requires_approval, description)
LOCALS_DATA = [
    ("LAB-INF-01", "Laboratorio de Cómputo 1 — Facultad de Informática",
     "LABORATORIO", 30, True,
     "Laboratorio docente con 30 PCs Dell OptiPlex equipadas con Ubuntu 22.04 LTS. "
     "Cuenta con proyector EPSON, pizarra blanca, climatización por A/A split y "
     "conexión cableada al backbone universitario. Software disponible: PostgreSQL 16, "
     "Node.js 20, Python 3.11, Visual Studio Code, IntelliJ IDEA Community."),
    ("LAB-INF-02", "Laboratorio de Cómputo 2 — Facultad de Informática",
     "LABORATORIO", 30, True,
     "Laboratorio docente con 30 estaciones de trabajo HP ProDesk con Windows 11 y "
     "dual-boot Ubuntu. Equipado con proyector, pantalla retráctil, A/A central y "
     "switch gestionable de 48 puertos. Orientado a asignaturas de redes y sistemas."),
    ("LAB-FIS-01", "Laboratorio de Física Aplicada",
     "LABORATORIO", 24, True,
     "Laboratorio para prácticas de Física Eléctrica, Electromagnetismo y Circuitos. "
     "Cuenta con 12 mesas modulares con fuentes de alimentación variable, osciloscopios "
     "Tektronix, multímetros Fluke y kits de componentes electrónicos."),
    ("AULA-201", "Aula 201 — Pabellón Docente",
     "AULA", 50, False,
     "Aula docente convencional con pizarra blanca, proyector techo, climatización por "
     "ventiladores de techo y 50 puestos individuales. Acceso a internet por WiFi "
     "institucional."),
    ("AULA-202", "Aula 202 — Pabellón Docente",
     "AULA", 45, False,
     "Aula con disposición flexible (mesas trapezoidales reconfigurables), pizarra "
     "doble, proyector y conexión a la red docente. Apta para clases prácticas "
     "y talleres."),
    ("AUDI-MARTI", "Auditorio José Martí",
     "AUDITORIO", 200, True,
     "Auditorio principal de la UHO con 200 butacas tapizadas, escenario elevado, "
     "sistema de audio profesional (consola Yamaha MG16XU), iluminación escénica, "
     "pantalla LED 4K y cabina de proyección. Espacio para eventos académicos, "
     "conferencias y actos protocolares."),
    ("SALA-RECT-01", "Sala de Reuniones del Rectorado",
     "SALA_REUNIONES", 14, True,
     "Sala ejecutiva del Rectorado con mesa de juntas para 14 personas, sistema de "
     "videoconferencia Polycom, pantalla 65\", climatización dual y servicio de "
     "cafetería protocolar bajo solicitud."),
    ("SALA-FCOM-01", "Sala de Reuniones — Facultad de Informática",
     "SALA_REUNIONES", 12, True,
     "Sala para reuniones de consejo de dirección, defensas internas y entrevistas. "
     "Mesa para 12 personas, televisor 55\", A/A split y pizarra magnética."),
    ("BIB-CENTRAL", "Sala de Estudio — Biblioteca Central",
     "BIBLIOTECA", 60, False,
     "Sala de lectura silenciosa con 60 puestos, iluminación natural, tomacorrientes "
     "individuales y WiFi de alta velocidad. Acceso al catálogo digital de la "
     "Biblioteca Central."),
    ("GIM-01", "Gimnasio Universitario",
     "GIMNASIO", 100, True,
     "Gimnasio cubierto multipropósito con cancha reglamentaria (baloncesto / voleibol), "
     "graderías para 100 espectadores, vestidores con duchas y sala anexa de pesas. "
     "Sede principal de los eventos deportivos universitarios."),
    ("CAFE-CENTRAL", "Cafetería Central",
     "CAFETERIA", 80, False,
     "Cafetería estudiantil con 80 plazas, servicio de almuerzos, meriendas y bebidas. "
     "Disponible para actividades de extensión y encuentros informales fuera del "
     "horario de servicio (previo coordinación)."),
]
