"""
Signals para trámites internos.

- Limpia imagen de mantenimiento al eliminar
- Captura el estado previo en pre_save
- En post_save dispara notificación + audit log si cambió el state
"""
from django.db.models.signals import post_delete, post_save, pre_save
from django.dispatch import receiver

from apps.audit.services import log_event
from apps.notifications.services import notify_state_change

from .models import (
    AccommodationProcedure,
    FeedingProcedure,
    MaintanceProcedure,
    TransportProcedure,
)

TRACKED_MODELS = (FeedingProcedure, AccommodationProcedure, TransportProcedure, MaintanceProcedure)


@receiver(post_delete, sender=MaintanceProcedure)
def delete_picture(sender, instance, **kwargs):
    if instance.picture:
        instance.picture.delete(False)


@receiver(pre_save)
def _capture_previous_state(sender, instance, **kwargs):
    if sender not in TRACKED_MODELS:
        return
    if not instance.pk:
        instance._previous_state = None
        return
    try:
        old = sender.objects.get(pk=instance.pk)
        instance._previous_state = old.state
    except sender.DoesNotExist:
        instance._previous_state = None

    # Validación: motivo de rechazo obligatorio
    from django.core.exceptions import ValidationError
    if instance.state == 'RECHAZADO' and not (instance.observation or '').strip():
        raise ValidationError({'observation': 'Debe proporcionar un motivo al rechazar el trámite.'})


@receiver(post_save)
def _handle_state_change(sender, instance, created, **kwargs):
    if sender not in TRACKED_MODELS:
        return

    previous = getattr(instance, '_previous_state', None)
    current = getattr(instance, 'state', None)

    if created:
        log_event(
            action='create',
            resource=instance,
            description=f'{sender.__name__} creado',
            metadata={'state': current},
        )
        return

    if previous is not None and previous != current:
        log_event(
            action='state_change',
            resource=instance,
            description=f'{sender.__name__} cambió de estado',
            metadata={'old_state': previous, 'new_state': current},
        )
        notify_state_change(
            instance,
            old_state=previous,
            new_state=current,
            reason=getattr(instance, 'observation', '') or '',
        )
