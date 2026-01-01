from django.core.management.base import BaseCommand
from django.db import transaction

from secretaria_docente.models import Tramite as OldTramite


class Command(BaseCommand):
    help = 'Migra los trámites de secretaria_docente hacia el Tramite central en plataforma (prueba).' 

    def handle(self, *args, **options):
        self.stdout.write('Iniciando migración de trámites (secretaria_docente) -> plataforma.Tramite')
        created = 0
        skipped = 0
        errors = 0

        from plataforma.models.procedure import Tramite as CentralTramite, Solicitante
        from plataforma.models.procedure import EstadosTramites
        from secretaria_docente.models import TramiteSecretariaDocente

        old_qs = OldTramite.objects.all()

        for old in old_qs:
            try:
                # Si ya existe un trámite central con el mismo `numero_seguimiento`, omitir
                if old.numero_seguimiento and CentralTramite.objects.filter(numero_seguimiento=old.numero_seguimiento).exists():
                    skipped += 1
                    continue

                with transaction.atomic():
                    solicitante = None
                    if not old.usuario:
                        solicitante = Solicitante.objects.create(
                            nombre=old.nombre,
                            apellidos=old.apellidos,
                            ci=old.ci,
                            email=old.email,
                            telefono=old.telefono,
                        )

                    # Buscar estado equivalente por nombre o código
                    estado_obj = None
                    try:
                        estado_obj = EstadosTramites.objects.filter(nombre__iexact=old.estado).first()
                        if not estado_obj:
                            estado_obj = EstadosTramites.objects.filter(codigo__iexact=old.estado).first()
                    except Exception:
                        estado_obj = None

                    central = CentralTramite.objects.create(
                        nombre_tramite=old.nombre_tramite or 'Secretaría Docente',
                        usuario=old.usuario if old.usuario_id else None,
                        solicitante=solicitante,
                        estado=estado_obj,
                        observaciones=old.observaciones,
                        fecha_limite=old.fecha_limite,
                        numero_seguimiento=old.numero_seguimiento or '',
                    )

                    detalle = TramiteSecretariaDocente.objects.create(
                        tramite=central,
                        tipo_estudio=old.tipo_estudio,
                        tipo_est=old.tipo_est,
                        uso=old.uso,
                        uso_i=old.uso_i,
                        nombre=old.nombre,
                        apellidos=old.apellidos,
                        ci=old.ci,
                        email=old.email,
                        telefono=old.telefono,
                        tomo=old.tomo,
                        folio=old.folio,
                        numero=old.numero,
                        fecha=old.fecha,
                        estado=old.estado,
                        intereses=old.intereses,
                        organismo=old.organismo,
                        organismo_op=old.organismo_op,
                        motivo=old.motivo,
                        funcionario=old.funcionario,
                        carrera=old.carrera,
                        year=old.year,
                        programa_academico=old.programa_academico,
                        nombre_programa=old.nombre_programa,
                        tipo_pren=old.tipo_pren,
                        tipo_prei=old.tipo_prei,
                        tipo_posn=old.tipo_posn,
                        tipo_posi=old.tipo_posi,
                        legalizacion=old.legalizacion,
                        archivo=old.archivo,
                    )

                    created += 1

            except Exception as e:
                errors += 1
                self.stderr.write(f'Error migrando {old.pk}: {e}')

        self.stdout.write(self.style.SUCCESS(f'Migración completada. Creado: {created}, Omitidos: {skipped}, Errores: {errors}'))
