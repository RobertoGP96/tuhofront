from django.db import models
from django.utils.translation import gettext_lazy as _
from .user import User

class Note(models.Model):
    """
    Model to manage notes or observations related to other models.
    """
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='notes',
        verbose_name=_("User")
    )
    content = models.TextField(
        verbose_name=_("Content"),
        help_text=_("Note content")
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = _("Note")
        verbose_name_plural = _("Notes")
        ordering = ['-created_at']

    def __str__(self):
        return f'Note by {self.user.username} on {self.created_at.strftime("%Y-%m-%d")}'
