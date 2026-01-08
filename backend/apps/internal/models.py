from django.db import models
from django.utils.translation import gettext_lazy as _
from apps.platform.models import Procedure, User, Department, Area

class Guest(models.Model):
    SEX_CHOICES = [("M", "MASCULINO"), ("F", "FEMENINO")]
    name = models.CharField(max_length=100)
    sex = models.CharField(max_length=1, choices=SEX_CHOICES)
    identification = models.CharField(max_length=11)

class FeedingDays(models.Model):
    date = models.DateField(verbose_name=_("Fecha"), help_text=_("Fecha del día de alimentación"))
    breakfast = models.IntegerField(default=0, verbose_name=_("Desayunos"), help_text=_("Cantidad de desayunos"))
    lunch = models.IntegerField(default=0, verbose_name=_("Almuerzos"), help_text=_("Cantidad de almuerzos"))
    dinner = models.IntegerField(default=0, verbose_name=_("Cenas"), help_text=_("Cantidad de cenas"))
    snack = models.IntegerField(default=0, verbose_name=_("Meriendas"), help_text=_("Cantidad de meriendas"))

    class Meta:
        verbose_name = _("Día de Alimentación")
        verbose_name_plural = _("Días de Alimentación")
        ordering = ["date"]

    def __str__(self):
        return f"Alimentación - {self.date}"

class FeedingProcedure(Procedure):
    FEEDING_CHOICES = [("RESTAURANT", "Restaurante Especializado"), ("HOTELITO", "Hotelito de posgrado de la UHO")]
    feeding_type = models.CharField(max_length=20, choices=FEEDING_CHOICES, verbose_name=_("Tipo de alimentación"), help_text=_("Tipo de servicio de alimentación solicitado"))
    start_day = models.DateField(verbose_name=_("Fecha de inicio"), help_text=_("Fecha de inicio del servicio"))
    end_day = models.DateField(verbose_name=_("Fecha de fin"), help_text=_("Fecha de fin del servicio"))
    description = models.TextField(verbose_name=_("Descripción"), help_text=_("Descripción detallada de la solicitud"))
    amount = models.IntegerField(verbose_name=_("Cantidad de personas"), help_text=_("Número de personas a alimentar"))
    feeding_days = models.ManyToManyField(FeedingDays, related_name="feeding_procedures", verbose_name=_("Días de alimentación"), help_text=_("Días específicos de alimentación"))

    class Meta:
        verbose_name = _("Solicitud de Alimentación")
        verbose_name_plural = _("Solicitudes de Alimentación")
        ordering = ["-created_at"]

    def __str__(self):
        return f"Alimentación - {self.user.username} ({self.get_state_display()})"

class AccommodationProcedure(Procedure):
    ACCOMMODATION_CHOICES = [('HOTEL', 'Instalaciones Hoteleras'), ('POSGRADO', 'Hotelito de posgrado de la UHO')]
    accommodation_type = models.CharField(max_length=20, choices=ACCOMMODATION_CHOICES, verbose_name=_("Tipo de alojamiento"), help_text=_("Tipo de alojamiento solicitado"))
    start_day = models.DateField(verbose_name=_("Fecha de inicio"), help_text=_("Fecha de inicio del alojamiento"))
    end_day = models.DateField(verbose_name=_("Fecha de fin"), help_text=_("Fecha de fin del alojamiento"))
    description = models.TextField(verbose_name=_("Descripción"), help_text=_("Descripción detallada de la solicitud"))
    guests = models.ManyToManyField(Guest, related_name="accommodation_procedures", verbose_name=_("Huéspedes"), help_text=_("Huéspedes incluidos en el alojamiento"))
    feeding_days = models.ManyToManyField(FeedingDays, blank=True, related_name="accommodation_procedures", verbose_name=_("Días de alimentación"), help_text=_("Días en los que se solicita alimentación"))

    class Meta:
        verbose_name = _("Solicitud de Alojamiento")
        verbose_name_plural = _("Solicitudes de Alojamiento")
        ordering = ["-created_at"]

    def __str__(self):
        return f"Alojamiento - {self.user.username} ({self.get_state_display()})"

class TransportProcedureType(models.Model):
    name = models.CharField(max_length=50, unique=True, verbose_name=_("Nombre"), help_text=_("Nombre del tipo de transporte"))

    class Meta:
        verbose_name = _("Tipo de Procedimiento de Transporte")
        verbose_name_plural = _("Tipos de Procedimientos de Transporte")
        ordering = ["name"]

    def __str__(self):
        return self.name

class TransportProcedure(Procedure):
    procedure_type = models.ForeignKey(TransportProcedureType, on_delete=models.SET_NULL, null=True, related_name="transport_procedures", verbose_name=_("Tipo de transporte"), help_text=_("Tipo de procedimiento de transporte"))
    departure_time = models.DateTimeField(verbose_name=_("Hora de salida"), help_text=_("Fecha y hora de salida"))
    return_time = models.DateTimeField(verbose_name=_("Hora de regreso"), help_text=_("Fecha y hora de regreso"))
    departure_place = models.CharField(max_length=150, verbose_name=_("Lugar de salida"), help_text=_("Lugar de salida del transporte"))
    return_place = models.CharField(max_length=150, verbose_name=_("Lugar de regreso"), help_text=_("Lugar de regreso del transporte"))
    passengers = models.IntegerField(verbose_name=_("Cantidad de pasajeros"), help_text=_("Número de personas a transportar"))
    description = models.TextField(verbose_name=_("Descripción"), help_text=_("Descripción detallada de la solicitud"))
    plate = models.CharField(max_length=10, blank=True, null=True, verbose_name=_("Placa del vehículo"), help_text=_("Placa del vehículo asignado"))
    round_trip = models.BooleanField(default=False, verbose_name=_("Viaje redondo"), help_text=_("Indica si es un viaje de ida y vuelta"))

    class Meta:
        verbose_name = _("Solicitud de Transporte")
        verbose_name_plural = _("Solicitudes de Transporte")
        ordering = ["-created_at"]

    def __str__(self):
        return f"Transporte - {self.user.username} ({self.get_state_display()})"

class MaintanceProcedureType(models.Model):
    name = models.CharField(max_length=50, unique=True, verbose_name=_("Nombre"), help_text=_("Nombre del tipo de mantenimiento"))

    class Meta:
        verbose_name = _("Tipo de Procedimiento de Mantenimiento")
        verbose_name_plural = _("Tipos de Procedimientos de Mantenimiento")
        ordering = ["name"]

    def __str__(self):
        return self.name

class MaintancePriority(models.Model):
    name = models.CharField(max_length=50, unique=True, verbose_name=_("Nombre"), help_text=_("Nombre del nivel de prioridad"))

    class Meta:
        verbose_name = _("Prioridad de Mantenimiento")
        verbose_name_plural = _("Prioridades de Mantenimiento")
        ordering = ["name"]

    def __str__(self):
        return self.name

class MaintanceProcedure(Procedure):
    description = models.TextField(verbose_name=_("Descripción del problema"), help_text=_("Descripción detallada del problema o mantenimiento requerido"))
    picture = models.ImageField(upload_to="maintenance/images/", blank=True, null=True, verbose_name=_("Fotografía"), help_text=_("Fotografía del problema o área a mantener"))
    procedure_type = models.ForeignKey(MaintanceProcedureType, on_delete=models.SET_NULL, null=True, related_name="maintenance_procedures", verbose_name=_("Tipo de mantenimiento"), help_text=_("Tipo de procedimiento de mantenimiento"))
    priority = models.ForeignKey(MaintancePriority, on_delete=models.SET_NULL, null=True, related_name="maintenance_procedures", verbose_name=_("Prioridad"), help_text=_("Nivel de prioridad del mantenimiento"))

    class Meta:
        verbose_name = _("Solicitud de Mantenimiento")
        verbose_name_plural = _("Solicitudes de Mantenimiento")
        ordering = ["-created_at"]

    def __str__(self):
        return f"Mantenimiento - {self.user.username} ({self.get_state_display()})"
