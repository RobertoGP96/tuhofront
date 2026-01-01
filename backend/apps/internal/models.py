from django.db import models
from backend.apps.plataforma.models.models import TramiteGeneral, Department, Area
from usuarios.models import Usuario

class Guest(models.Model):
    SEX_CHOICES = [
        ('M', 'MASCULINO'),
        ('F', 'FEMENINO')
    ]
    name = models.CharField(max_length=100)
    sex = models.CharField(max_length=1, choices=SEX_CHOICES)
    identification = models.CharField(max_length=11)
    
class FeedingDays(models.Model):
    date = models.DateField()
    breakfast = models.IntegerField()
    lunch = models.IntegerField()
    dinner = models.IntegerField()
    snack = models.IntegerField()
    

    
class Note(models.Model):
    STATE_CHOICES = [
        ('PENDIENTE', 'Pendiente'),
        ('APROBADO', 'Aprobado'),
        ('FINALIZADO', 'Finalizado'),
        ('CANCELADO', 'Cancelado'),
        ('RECHAZADO', 'Rechazado')
    ]
    
    state = models.CharField(max_length=20, choices=STATE_CHOICES)
    description = models.TextField()

# TRÁMITES
class Procedure(TramiteGeneral):
    
    STATE_CHOICES = [
        ('PENDIENTE', 'Pendiente'),
        ('APROBADO', 'Aprobado'),
        ('FINALIZADO', 'Finalizado'),
        ('CANCELADO', 'Cancelado'),
        ('RECHAZADO', 'Rechazado')
    ]
    
    user = models.ForeignKey(Usuario, models.SET_NULL, null=True)
    document = models.FileField(upload_to='documents/', blank=True, null=True)
    state = models.CharField(max_length=20, choices=STATE_CHOICES, default='PENDIENTE')
    department = models.ForeignKey(Department, models.CASCADE)
    area = models.ForeignKey(Area, models.CASCADE)
    notes = models.ManyToManyField(Note)

class FeedingProcedure(Procedure):
    FEEDING_CHOICES = [
        ('A', 'Restaurante Especializado'),
        ('B', 'Hotelito de posgrado de la UHO')
    ]
    
    nombre_tramite = "Tramite de Alimentacion"
    feeding_type = models.CharField(max_length=1, choices=FEEDING_CHOICES)
    start_day = models.DateField()
    end_day = models.DateField()
    description = models.TextField()
    ammount = models.IntegerField()
    feeding_days = models.ManyToManyField(FeedingDays)

class AccommodationProcedure(Procedure):
    ACCOMMODATION_CHOICES = [
        ('A', 'Instalaciones Hoteleras'),
        ('B', 'Hotelito de posgrado de la UHO')
    ]
    
    nombre_tramite = "Tramite de Alojamiento"
    accommodation_type = models.CharField(max_length=1, choices=ACCOMMODATION_CHOICES)
    start_day = models.DateField()
    end_day = models.DateField()
    description = models.TextField()
    guests = models.ManyToManyField(Guest)
    feeding_days = models.ManyToManyField(FeedingDays, blank=True)

class TransportProcedureType(models.Model):
    name = models.TextField(max_length=20)

class TransportProcedure(Procedure):
    
    nombre_tramite = "Tramite de Transporte"
    procedure_type = models.ForeignKey(TransportProcedureType, on_delete=models.SET_NULL, null=True)
    departure_time = models.DateTimeField()
    return_time = models.DateTimeField()
    departure_place = models.CharField(max_length=150)
    return_place = models.CharField(max_length=150)
    passengers = models.IntegerField()
    description = models.TextField()
    plate = models.CharField(max_length=10, blank=True, null=True)
    round_trip = models.BooleanField(default=False)
    
class MaintanceProcedureType(models.Model):
    name = models.TextField(max_length=20)
    
class MaintancePriority(models.Model):
    name = models.TextField(max_length=20)

class MaintanceProcedure(Procedure):
    
    nombre_tramite = "Tramite de Mantenimiento"
    description = models.TextField()
    picture = models.ImageField(upload_to='images/', blank=True, null=True)
    procedure_type = models.ForeignKey(MaintanceProcedureType, on_delete=models.SET_NULL, null=True)
    priority = models.ForeignKey(MaintancePriority, on_delete=models.SET_NULL, null=True)

