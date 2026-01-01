from django.db import models
from platform.models import TramiteGeneral, Department, Area
from users.models import Usuario


class Guest(models.Model):
    SEX_CHOICES = [("M", "MASCULINO"), ("F", "FEMENINO")]
    name = models.CharField(max_length=100)
    sex = models.CharField(max_length=1, choices=SEX_CHOICES)
    identification = models.CharField(max_length=11)
