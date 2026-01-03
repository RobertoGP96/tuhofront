# models.py
from django.db import models
from django.core.validators import MinLengthValidator

from .department import Department



class Area(models.Model):
    """
    Model to manage areas that belong to departments.
    """
    name = models.CharField(
        max_length=100,
        validators=[MinLengthValidator(2)],
        verbose_name="Area name"
    )
    
    department = models.ForeignKey(
        Department,
        on_delete=models.CASCADE,
        related_name='areas',
        verbose_name="Department"
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'areas'
        verbose_name = "Area"
        verbose_name_plural = "Areas"
        ordering = ['department', 'name']
        unique_together = [['name', 'department']]  # El nombre del área debe ser único dentro del departamento

    def __str__(self):
        return f"{self.name} ({self.department.name})"