from django.db import models
from internal.models import FeedingDays
from internal.models import Guest
from internal.models import Procedure

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
