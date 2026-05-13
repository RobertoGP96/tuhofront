"""
Comando de seed para entornos de desarrollo / demo.

Crea:
- Usuarios de prueba uno por cada user_type
- Departamentos y áreas
- Locales (laboratorios, aulas, auditorios)
- Algunas noticias publicadas
- Catálogos de tipos/prioridades de mantenimiento y transporte
- Trámites internos de ejemplo (alimentación, alojamiento, transporte, mantenimiento)
- Una reserva aprobada y una pendiente

Uso:
    python manage.py seed_demo
    python manage.py seed_demo --reset   # borra y vuelve a crear los datos de prueba

Credenciales por defecto: usuario `admin` / contraseña `Admin12345`.
Todos los demás usuarios usan la contraseña `Demo12345`.
"""

from datetime import timedelta
from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone

from apps.platform.models import User, Department, Area, News


DEMO_PASSWORD = "Demo12345"
ADMIN_PASSWORD = "Admin12345"

# (username, email, first_name, last_name, user_type, id_card, phone)
DEMO_USERS = [
    ("admin",        "admin@uho.edu.cu",        "Admin",   "Sistema",     "ADMIN",              "85010112345", "52345678"),
    ("secretaria",   "secretaria@uho.edu.cu",   "Lucia",   "Pérez",        "SECRETARIA_DOCENTE", "85020212345", "52345679"),
    ("profesor",     "profesor@uho.edu.cu",     "Carlos",  "Rodríguez",    "PROFESOR",           "80030312345", "52345680"),
    ("trabajador",   "trabajador@uho.edu.cu",   "María",   "González",     "TRABAJADOR",         "85040412345", "52345681"),
    ("estudiante",   "estudiante@uho.edu.cu",   "Juan",    "Martínez",     "ESTUDIANTE",         "02050512345", "52345682"),
    ("externo",      "externo@uho.edu.cu",      "Pedro",   "Suárez",        "EXTERNO",            "78060612345", "52345683"),
    ("gestor_int",   "gestor.int@uho.edu.cu",   "Ana",     "Díaz",          "GESTOR_INTERNO",     "82070712345", "52345684"),
    ("gestor_tram",  "gestor.tram@uho.edu.cu",  "Luis",    "Hernández",     "GESTOR_TRAMITES",    "82080812345", "52345685"),
    ("gestor_res",   "gestor.res@uho.edu.cu",   "Elena",   "Ramos",         "GESTOR_RESERVAS",    "82090912345", "52345686"),
]


class Command(BaseCommand):
    help = "Carga datos de prueba para desarrollo / demo."

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
            User.objects.filter(username__in=[u[0] for u in DEMO_USERS]).delete()
            Department.objects.filter(name__startswith="Demo ").delete()
            News.objects.filter(slug__startswith="demo-").delete()

        self.stdout.write(self.style.MIGRATE_HEADING("Sembrando datos de demo..."))

        users = self._seed_users()
        departments, areas = self._seed_departments_and_areas()
        self._seed_news(users["admin"])
        self._seed_locals_and_reservation(users)
        self._seed_internal_catalogs_and_procedures(users, departments, areas)

        self.stdout.write("")
        self.stdout.write(self.style.SUCCESS("Seed completado."))
        self.stdout.write("")
        self.stdout.write("Credenciales de acceso (todas activas y verificadas):")
        self.stdout.write(f"  admin       / {ADMIN_PASSWORD}   (Administrador, is_staff + is_superuser)")
        for username, _email, fn, ln, ut, _ic, _ph in DEMO_USERS[1:]:
            self.stdout.write(f"  {username:<11} / {DEMO_PASSWORD}    ({ut}, {fn} {ln})")
        self.stdout.write("")
        self.stdout.write("Documentación de la API: http://localhost:8000/api/docs/")

    # ------------------------------------------------------------------ users

    def _seed_users(self):
        users = {}
        for username, email, fn, ln, ut, id_card, phone in DEMO_USERS:
            existing = User.objects.filter(username=username).first()
            password = ADMIN_PASSWORD if username == "admin" else DEMO_PASSWORD
            is_admin = username == "admin"
            is_staff_role = ut in (
                "ADMIN",
                "SECRETARIA_DOCENTE",
                "GESTOR_INTERNO",
                "GESTOR_TRAMITES",
                "GESTOR_RESERVAS",
            )
            if existing is None:
                user = User(
                    username=username,
                    email=email,
                    first_name=fn,
                    last_name=ln,
                    user_type=ut,
                    id_card=id_card,
                    phone=phone,
                    is_active=True,
                    email_verified=True,
                    is_staff=is_admin or is_staff_role,
                    is_superuser=is_admin,
                )
                user.set_password(password)
                user.save()
                created = True
            else:
                user = existing
                user.email = email
                user.first_name = fn
                user.last_name = ln
                user.user_type = ut
                user.id_card = id_card
                user.phone = phone
                user.is_active = True
                user.email_verified = True
                user.is_staff = is_admin or is_staff_role
                user.is_superuser = is_admin
                user.set_password(password)
                user.save()
                created = False
            users[username] = user
            verbo = "Creado" if created else "Actualizado"
            self.stdout.write(f"  {verbo} usuario: {username} ({ut})")
        return users

    # ----------------------------------------------------------- departments

    def _seed_departments_and_areas(self):
        data = {
            "Demo Facultad de Informática": ["Demo Ingeniería Informática", "Demo Ciencias de la Computación"],
            "Demo Facultad de Ingeniería": ["Demo Ingeniería Civil", "Demo Ingeniería Eléctrica"],
            "Demo Vicerrectoría Administrativa": ["Demo Servicios Generales", "Demo Mantenimiento"],
        }
        departments = {}
        areas = {}
        for dep_name, area_names in data.items():
            dep, _ = Department.objects.get_or_create(name=dep_name)
            departments[dep_name] = dep
            for area_name in area_names:
                area, _ = Area.objects.get_or_create(name=area_name, department=dep)
                areas[area_name] = area
        self.stdout.write(f"  Departamentos: {len(departments)} / Áreas: {len(areas)}")
        return departments, areas

    # ----------------------------------------------------------------- news

    def _seed_news(self, admin_user):
        items = [
            {
                "title": "Bienvenida al sistema TUho",
                "slug": "demo-bienvenida-tuho",
                "category": "GENERAL",
                "summary": "Sistema integral de gestión universitaria de la Universidad de Holguín.",
                "body": "Esta es una noticia de demo para validar el flujo público de noticias.",
                "is_published": True,
                "featured": True,
            },
            {
                "title": "Convocatoria de proyectos de investigación 2026",
                "slug": "demo-convocatoria-investigacion",
                "category": "RESEARCH",
                "summary": "Abierta la convocatoria para nuevos proyectos.",
                "body": "Los profesores e investigadores pueden presentar propuestas hasta el 30 de junio.",
                "is_published": True,
            },
            {
                "title": "Cronograma de mantenimiento de laboratorios",
                "slug": "demo-mantenimiento-labs",
                "category": "MANAGEMENT",
                "summary": "Mantenimiento programado de los laboratorios de cómputo.",
                "body": "Los laboratorios LAB-01 y LAB-02 estarán cerrados por mantenimiento la próxima semana.",
                "is_published": True,
            },
        ]
        for item in items:
            News.objects.update_or_create(
                slug=item["slug"],
                defaults={
                    **item,
                    "author": admin_user,
                    "publication_date": timezone.now(),
                },
            )
        self.stdout.write(f"  Noticias publicadas: {len(items)}")

    # ----------------------------------------------------------------- labs

    def _seed_locals_and_reservation(self, users):
        from apps.labs.models import Local, LocalReservation
        from apps.labs.enums import LocalTypeEnum, ReservationStateEnum, ReservationPurposeEnum

        locals_data = [
            ("LAB-01", "Laboratorio de Cómputo 1", LocalTypeEnum.LABORATORIO, 30, True),
            ("LAB-02", "Laboratorio de Cómputo 2", LocalTypeEnum.LABORATORIO, 30, True),
            ("AULA-101", "Aula 101", LocalTypeEnum.AULA, 50, False),
            ("AUDI-A", "Auditorio Principal", LocalTypeEnum.AUDITORIO, 200, True),
            ("SALA-R1", "Sala de Reuniones 1", LocalTypeEnum.SALA_REUNIONES, 12, True),
        ]
        locals_obj = {}
        for code, name, ltype, cap, approval in locals_data:
            obj, _ = Local.objects.get_or_create(
                code=code,
                defaults={
                    "name": name,
                    "local_type": ltype,
                    "capacity": cap,
                    "description": f"{name} - dato de demo",
                    "is_active": True,
                    "requires_approval": approval,
                },
            )
            locals_obj[code] = obj
        self.stdout.write(f"  Locales: {len(locals_obj)}")

        # Una reserva pendiente y una aprobada
        now = timezone.now()
        start_pending = (now + timedelta(days=2)).replace(hour=9, minute=0, second=0, microsecond=0)
        start_approved = (now + timedelta(days=4)).replace(hour=14, minute=0, second=0, microsecond=0)

        profesor = users["profesor"]
        admin = users["admin"]

        pending, created_p = LocalReservation.objects.get_or_create(
            local=locals_obj["LAB-01"],
            start_time=start_pending,
            defaults={
                "user": profesor,
                "end_time": start_pending + timedelta(hours=2),
                "purpose": ReservationPurposeEnum.CLASE,
                "purpose_detail": "Clase práctica de Programación I (demo)",
                "expected_attendees": 25,
                "responsible_name": profesor.get_full_name() or profesor.username,
                "responsible_phone": profesor.phone or "52345680",
                "responsible_email": profesor.email,
                "state": ReservationStateEnum.PENDIENTE,
            },
        )
        approved, created_a = LocalReservation.objects.get_or_create(
            local=locals_obj["AUDI-A"],
            start_time=start_approved,
            defaults={
                "user": profesor,
                "end_time": start_approved + timedelta(hours=3),
                "purpose": ReservationPurposeEnum.CONFERENCIA,
                "purpose_detail": "Conferencia de demo sobre IA",
                "expected_attendees": 120,
                "responsible_name": profesor.get_full_name() or profesor.username,
                "responsible_phone": profesor.phone or "52345680",
                "responsible_email": profesor.email,
                "state": ReservationStateEnum.APROBADA,
                "approved_by": admin,
                "approved_at": now,
            },
        )
        self.stdout.write(
            f"  Reservas: pendiente={pending.pk} aprobada={approved.pk}"
        )

    # ------------------------------------------------------- internal catalogs

    def _seed_internal_catalogs_and_procedures(self, users, departments, areas):
        from apps.internal.models import (
            TransportProcedureType,
            MaintanceProcedureType,
            MaintancePriority,
            FeedingProcedure,
            AccommodationProcedure,
            TransportProcedure,
            MaintanceProcedure,
        )

        transport_types = ["Traslado interno", "Viaje provincial", "Viaje nacional"]
        for n in transport_types:
            TransportProcedureType.objects.get_or_create(name=n)

        maint_types = ["Eléctrico", "Plomería", "Climatización", "Computación"]
        for n in maint_types:
            MaintanceProcedureType.objects.get_or_create(name=n)

        priorities = ["Baja", "Media", "Alta", "Urgente"]
        for n in priorities:
            MaintancePriority.objects.get_or_create(name=n)

        self.stdout.write(
            f"  Catálogos internos: transport_types={len(transport_types)} "
            f"maint_types={len(maint_types)} priorities={len(priorities)}"
        )

        profesor = users["profesor"]
        trabajador = users["trabajador"]
        today = timezone.now().date()

        # Trámite de alimentación
        FeedingProcedure.objects.get_or_create(
            user=profesor,
            description="Solicitud de almuerzo para visita académica (demo).",
            defaults={
                "feeding_type": "RESTAURANT",
                "start_day": today + timedelta(days=3),
                "end_day": today + timedelta(days=5),
                "amount": 5,
            },
        )

        # Trámite de alojamiento
        AccommodationProcedure.objects.get_or_create(
            user=profesor,
            description="Alojamiento para conferencista invitado (demo).",
            defaults={
                "accommodation_type": "POSGRADO",
                "start_day": today + timedelta(days=7),
                "end_day": today + timedelta(days=10),
            },
        )

        # Trámite de transporte
        tt = TransportProcedureType.objects.first()
        if tt:
            now = timezone.now()
            TransportProcedure.objects.get_or_create(
                user=profesor,
                description="Solicitud de transporte para visita técnica (demo).",
                defaults={
                    "procedure_type": tt,
                    "departure_time": now + timedelta(days=5, hours=8),
                    "return_time": now + timedelta(days=5, hours=18),
                    "departure_place": "Universidad de Holguín — sede central",
                    "return_place": "Universidad de Holguín — sede central",
                    "passengers": 12,
                    "round_trip": True,
                },
            )

        # Trámite de mantenimiento
        mt = MaintanceProcedureType.objects.first()
        prio = MaintancePriority.objects.filter(name="Media").first()
        if mt and prio:
            MaintanceProcedure.objects.get_or_create(
                user=trabajador,
                description="Aire acondicionado del laboratorio LAB-01 no enfría (demo).",
                defaults={"procedure_type": mt, "priority": prio},
            )

        self.stdout.write("  Trámites internos de ejemplo creados.")
