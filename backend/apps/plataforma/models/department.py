  
from plataforma.models import models

class Department(models.Model):
    name = models.CharField(max_length=100)
    area = models.ForeignKey('Area', on_delete=models.CASCADE, null=True, blank=True)
    
