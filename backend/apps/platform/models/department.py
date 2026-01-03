# models/department.py
from django.db import models
from django.core.validators import MinLengthValidator


class Department(models.Model):
    """
    Model to manage departments.
    Each department can have multiple areas.
    """
    name = models.CharField(
        max_length=100,
        unique=True,
        validators=[MinLengthValidator(2)],
        verbose_name="Department name"
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'departments'
        verbose_name = "Department"
        verbose_name_plural = "Departments"
        ordering = ['name']

    def __str__(self):
        return self.name

    @property
    def total_areas(self):
        """Returns the total number of areas in this department."""
        return self.areas.count()