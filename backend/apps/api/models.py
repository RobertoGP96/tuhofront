from django.db import models

# Create your models here.
from django.db import models

class Area(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField()

    def __str__(self):
        return self.nombre
    