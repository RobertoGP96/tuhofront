from enum import Enum

class NewsCategoryEnum(str, Enum):
    GENERAL = "General"
    ACADEMIC = "Académica"
    MANAGEMENT = "Administrativa"
    ESTUDENT = "Estudiantil"
    CULTURAL ="Cultural"
    DEPORTIVA = "Deportiva"
    RESEARCH = "Investigación"
    EXTENTION = "Extensión Universitaria"


class ProcedureStateEnum(str, Enum):
    SENDED='Enviado'
    IN_PROCESS='En proceso'
    REQ_INFO='Requiere información adicional'
    APRUBAD='Aprobado'
    REFUSED='Rechazado'
    FINALY='Finalizado'
    CANCELED='Cancelado'