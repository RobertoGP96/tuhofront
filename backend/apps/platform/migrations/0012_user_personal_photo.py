# Generated for UHo external auth integration

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('platform', '0011_merge_20260515_1009'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='personal_photo',
            field=models.TextField(
                blank=True,
                default='',
                help_text=(
                    'Avatar (data URL base64 ej. data:image/png;base64,... o URL '
                    'externa). Sincronizado desde el proveedor externo de '
                    'autenticación cuando esté disponible.'
                ),
                verbose_name='Foto de perfil',
            ),
        ),
    ]
