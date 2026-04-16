"""
Signals para el módulo de reservas de locales.
"""
from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver

from apps.audit.services import log_event
from apps.notifications.services import notify_state_change

from .models import LocalReservation


@receiver(pre_save, sender=LocalReservation)
def _capture_previous_state(sender, instance, **kwargs):
    if not instance.pk:
        instance._previous_state = None
        return
    try:
        old = sender.objects.get(pk=instance.pk)
        instance._previous_state = old.state
    except sender.DoesNotExist:
        instance._previous_state = None


@receiver(post_save, sender=LocalReservation)
def _handle_state_change(sender, instance, created, **kwargs):
    previous = getattr(instance, '_previous_state', None)
    current = getattr(instance, 'state', None)

    if created:
        log_event(
            action='create',
            resource=instance,
            description='Reserva de local creada',
            metadata={'state': current, 'local': str(instance.local_id)},
        )
        return

    if previous is not None and previous != current:
        reason = ''
        if current == 'RECHAZADA':
            reason = instance.rejection_reason
        elif current == 'CANCELADA':
            reason = instance.cancellation_reason

        log_event(
            action='state_change',
            resource=instance,
            description='Cambio de estado de reserva',
            metadata={
                'old_state': previous,
                'new_state': current,
                'reason': reason,
            },
        )
        notify_state_change(
            instance,
            old_state=previous,
            new_state=current,
            reason=reason,
        )
