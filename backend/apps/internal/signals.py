from django.db.models.signals import post_delete
from django.dispatch import receiver
from .models import MaintanceProcedure, Procedure

@receiver(post_delete, sender=Procedure)
def delete_document(sender, instance, **kwargs):
    if instance.document:
        instance.document.delete(False)

@receiver(post_delete, sender=MaintanceProcedure)
def delete_picture(sender, instance, **kwargs):
    if instance.picture:
        instance.picture.delete(False)