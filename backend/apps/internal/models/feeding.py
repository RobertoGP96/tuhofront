from django.db import models
from internal.models import Procedure


class FeedingDays(models.Model):
    date = models.DateField()
    breakfast = models.IntegerField()
    lunch = models.IntegerField()
    dinner = models.IntegerField()
    snack = models.IntegerField()


class FeedingProcedure(Procedure):
    FEEDING_CHOICES = [
        ("A", "Restaurante Especializado"),
        ("B", "Hotelito de posgrado de la UHO"),
    ]

    nombre_tramite = "Tramite de Alimentacion"
    feeding_type = models.CharField(max_length=1, choices=FEEDING_CHOICES)
    start_day = models.DateField()
    end_day = models.DateField()
    description = models.TextField()
    ammount = models.IntegerField()
    feeding_days = models.ManyToManyField(FeedingDays)
