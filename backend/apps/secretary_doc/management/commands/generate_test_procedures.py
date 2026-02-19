import random
from datetime import datetime, timedelta
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from apps.platform.models.procedure import Procedure
from apps.secretary_doc.models.procedure import SecretaryDocProcedure
from apps.secretary_doc.choices import (
    STUDY_TYPE_CHOICES, STUDY_VISIBILITY_CHOICES, INTEREST_CHOICES,
    ORGANISM_CHOICES, ACADEMIC_PROGRAM_CHOICES
)

User = get_user_model()

class Command(BaseCommand):
    help = 'Genera trámites de prueba para Secretaría Docente'

    def add_arguments(self, parser):
        parser.add_argument('count', type=int, nargs='?', default=20, 
                          help='Número de trámites a generar (por defecto: 20)')

    def handle(self, *args, **options):
        count = options['count']
        self.stdout.write(self.style.SUCCESS(f'Generando {count} trámites de prueba...'))

        # Obtener un usuario administrador o crear uno si no existe
        try:
            user = User.objects.filter(is_staff=True).first()
            if not user:
                user = User.objects.create_superuser(
                    username='admin',
                    email='admin@example.com',
                    password='admin123',
                    first_name='Admin',
                    last_name='User'
                )
                self.stdout.write(self.style.SUCCESS('Usuario administrador creado'))
        except Exception as e:
            self.stderr.write(self.style.ERROR(f'Error al obtener/crear usuario: {e}'))
            return

        # Listas de datos de prueba
        nombres = ['Juan', 'María', 'Pedro', 'Ana', 'Carlos', 'Laura', 'José', 'Elena']
        apellidos = ['González', 'Rodríguez', 'López', 'Martínez', 'Pérez', 'Sánchez', 'Ramírez']
        carreras = [
            'Ingeniería Informática', 'Derecho', 'Medicina', 'Arquitectura', 
            'Economía', 'Contabilidad', 'Psicología', 'Periodismo'
        ]
        
        for i in range(1, count + 1):
            try:
                # Crear el trámite principal
                tramite = Procedure.objects.create(
                    name=f'Trámite de Prueba {i}',
                    created_by=user,
                    updated_by=user,
                    status='draft'
                )

                # Crear el detalle del trámite de secretaría
                tramite_secretaria = SecretaryDocProcedure.objects.create(
                    tramite=tramite,
                    tipo_estudio=random.choice(STUDY_TYPE_CHOICES)[0],
                    tipo_est=random.choice(STUDY_VISIBILITY_CHOICES)[0],
                    uso=random.choice(STUDY_VISIBILITY_CHOICES)[0],
                    uso_i=random.choice(STUDY_VISIBILITY_CHOICES)[0],
                    nombre=f'{random.choice(nombres)}',
                    apellidos=f'{random.choice(apellidos)} {random.choice(apellidos)}',
                    ci=f'{random.randint(10000000000, 99999999999)}',
                    email=f'usuario{i}@ejemplo.com',
                    telefono=f'5{random.randint(1000000, 9999999)}',
                    tomo=f'{random.randint(1, 10):04d}',
                    folio=f'{random.randint(1, 100):04d}',
                    numero=f'{random.randint(1000, 9999):04d}',
                    fecha=datetime.now() - timedelta(days=random.randint(1, 365)),
                    estado=random.choice(Estado.choices)[0],
                    intereses=random.choice(INTEREST_CHOICES)[0],
                    organismo=random.choice(ORGANISM_CHOICES)[0],
                    organismo_op=random.choice(ORGANISM_CHOICES)[0],
                    motivo=f'Motivo de prueba para el trámite {i}',
                    funcionario='Funcionario de Prueba',
                    carrera=random.choice(carreras),
                    year=str(random.randint(2018, 2023)),
                    programa_academico=random.choice(ACADEMIC_PROGRAM_CHOICES)[0],
                    nombre_programa=f'Programa de Prueba {i}',
                    tipo_pren='Pregrado Nacional',
                    tipo_prei='Pregrado Internacional',
                    tipo_posn='Posgrado Nacional',
                    tipo_posi='Posgrado Internacional',
                    legalizacion='Legalización de Foto Copia de Título',
                    # Nota: El campo archivo es obligatorio pero no podemos subir un archivo aquí
                    # Deberás manejar la subida de archivos por separado o modificar el modelo
                    archivo='documentos/prueba.pdf'  # Asegúrate de que esta ruta exista en tu MEDIA_ROOT
                )

                self.stdout.write(
                    self.style.SUCCESS(f'Trámite {i} creado: {tramite_secretaria}')
                )

            except Exception as e:
                self.stderr.write(
                    self.style.ERROR(f'Error al crear trámite {i}: {str(e)}')
                )

        self.stdout.write(
            self.style.SUCCESS(f'Se generaron {count} trámites de prueba exitosamente')
        )
