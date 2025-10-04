from django.contrib import admin
from .models import (
    Guest, FeedingDays, FeedingProcedure, AccommodationProcedure,
    TransportProcedureType, TransportProcedure, MaintanceProcedureType,
    MaintancePriority, MaintanceProcedure, Procedure, Department, Area
)

# Register your models here.

admin.site.register(AccommodationProcedure)
admin.site.register(FeedingProcedure)
admin.site.register(MaintancePriority)
admin.site.register(MaintanceProcedureType)
admin.site.register(MaintanceProcedure)
admin.site.register(TransportProcedureType)
admin.site.register(TransportProcedure)
admin.site.register(Department)
admin.site.register(Area)
