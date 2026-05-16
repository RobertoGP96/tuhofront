# Generated for role consolidation.

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('platform', '0008_add_gestor_roles'),
    ]

    operations = [
        migrations.AlterField(
            model_name='user',
            name='user_type',
            field=models.CharField(
                choices=[
                    ('USUARIO', 'Usuario'),
                    ('GESTOR_INTERNO', 'Gestor de Trámites Internos'),
                    ('GESTOR_SECRETARIA', 'Gestor de Secretaría Docente'),
                    ('GESTOR_RESERVAS', 'Gestor de Reservas'),
                    ('ADMIN', 'Admin'),
                ],
                default='USUARIO',
                help_text='Categoría del usuario en el sistema universitario',
                max_length=20,
                verbose_name='Tipo de usuario',
            ),
        ),
    ]
