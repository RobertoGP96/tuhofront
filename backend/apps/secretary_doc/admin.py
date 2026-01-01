from django.contrib import admin
from import_export.admin import ImportExportModelAdmin
from .models import (
	Tramite,
)
# Register your models here.
admin.site.register(Tramite)

