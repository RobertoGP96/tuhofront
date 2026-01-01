from django.db import models
from internal.models import Procedure


class TransportProcedureType(models.Model):
    name = models.TextField(max_length=20)


class TransportProcedure(Procedure):
    nombre_tramite = "Tramite de Transporte"
    procedure_type = models.ForeignKey(
        TransportProcedureType, on_delete=models.SET_NULL, null=True
    )
    departure_time = models.DateTimeField()
    return_time = models.DateTimeField()
    departure_place = models.CharField(max_length=150)
    return_place = models.CharField(max_length=150)
    passengers = models.IntegerField()
    description = models.TextField()
    plate = models.CharField(max_length=10, blank=True, null=True)
    round_trip = models.BooleanField(default=False)
