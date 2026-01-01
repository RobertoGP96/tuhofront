from django.contrib import admin
from .models.models import Noticias , Email, Department, Area
# Register your models here.

admin.site.register(Noticias)
admin.site.register(Email)
admin.site.register(Department)
admin.site.register(Area)
