# Generated for role consolidation: LdapConfig.default_role choices/default.

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('settings_runtime', '0003_externalauth_provider'),
    ]

    operations = [
        migrations.AlterField(
            model_name='ldapconfig',
            name='default_role',
            field=models.CharField(
                choices=[
                    ('USUARIO', 'Usuario'),
                    ('GESTOR_INTERNO', 'Gestor de Trámites Internos'),
                    ('GESTOR_SECRETARIA', 'Gestor de Secretaría Docente'),
                    ('GESTOR_RESERVAS', 'Gestor de Reservas'),
                    ('ADMIN', 'Administrador'),
                ],
                default='USUARIO',
                help_text='user_type asignado si ningún grupo coincide',
                max_length=20,
            ),
        ),
    ]
