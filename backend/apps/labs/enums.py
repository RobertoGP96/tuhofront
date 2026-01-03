from django.db import models
from django.utils.translation import gettext_lazy as _


# ============================================================================
# ENUMS Y CHOICES
# ============================================================================

class LocalTypeEnum(models.TextChoices):
    """Tipos de locales disponibles"""
    AULA = "AULA", _("Aula")
    LABORATORIO = "LABORATORIO", _("Laboratorio")
    AUDITORIO = "AUDITORIO", _("Auditorio")
    SALA_REUNIONES = "SALA_REUNIONES", _("Sala de reuniones")
    BIBLIOTECA = "BIBLIOTECA", _("Biblioteca")
    GIMNASIO = "GIMNASIO", _("Gimnasio")
    CAFETERIA = "CAFETERIA", _("Cafetería")
    OTRO = "OTRO", _("Otro")


class ReservationStateEnum(models.TextChoices):
    """Estados de una reserva"""
    BORRADOR = "BORRADOR", _("Borrador")
    PENDIENTE = "PENDIENTE", _("Pendiente de aprobación")
    APROBADA = "APROBADA", _("Aprobada")
    RECHAZADA = "RECHAZADA", _("Rechazada")
    CANCELADA = "CANCELADA", _("Cancelada")
    EN_CURSO = "EN_CURSO", _("En curso")
    FINALIZADA = "FINALIZADA", _("Finalizada")


class ReservationPurposeEnum(models.TextChoices):
    """Propósitos de la reserva"""
    CLASE = "CLASE", _("Clase académica")
    EXAMEN = "EXAMEN", _("Examen")
    REUNION = "REUNION", _("Reunión")
    EVENTO = "EVENTO", _("Evento")
    TALLER = "TALLER", _("Taller")
    CONFERENCIA = "CONFERENCIA", _("Conferencia")
    ESTUDIO = "ESTUDIO", _("Estudio grupal")
    OTRO = "OTRO", _("Otro")
