from django.db import models
from platform.models import Procedure


class MaintanceProcedureType(models.Model):
    name = models.TextField(max_length=20)


class MaintancePriority(models.Model):
    name = models.TextField(max_length=20)


class MaintanceProcedure(Procedure):

    nombre_tramite = "Tramite de Mantenimiento"
    description = models.TextField()
    picture = models.ImageField(upload_to="images/", blank=True, null=True)
    procedure_type = models.ForeignKey(
        MaintanceProcedureType, on_delete=models.SET_NULL, null=True
    )
    priority = models.ForeignKey(
        MaintancePriority, on_delete=models.SET_NULL, null=True
    )
