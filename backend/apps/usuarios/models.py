from django.db import models
from django.contrib.auth.models import AbstractUser

# Create your models here.

# Modelo de Usuario
class Usuario(AbstractUser):
    token_activacion = models.CharField(max_length=100)
    carnet = models.CharField(max_length=11);
    telefono = models.CharField(max_length = 8);
    direccion = models.TextField()

    def __str__(self):
        return self.username   