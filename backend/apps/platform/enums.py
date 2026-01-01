from enum import Enum

class NewsCategoryEnum(str, Enum):
    GENERAL = "General"
    ACADEMIC = "Académica"
    MANAGEMENT = "Administrativa"
    STUDENT = "Estudiantil"
    CULTURAL = "Cultural"
    SPORTS = "Deportiva"
    RESEARCH = "Investigación"
    EXTENSION = "Extensión Universitaria"


class ProcedureStateEnum(str, Enum):
    SENT = 'Enviado'
    IN_PROCESS = 'En proceso'
    REQ_INFO = 'Requiere información adicional'
    APPROVED = 'Aprobado'
    REFUSED = 'Rechazado'
    FINALIZED = 'Finalizado'
    CANCELED = 'Cancelado'
    