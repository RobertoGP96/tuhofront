# Generated for UHo external auth integration

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('settings_runtime', '0005_alter_ldapconfig_group_to_role_map'),
    ]

    operations = [
        migrations.AddField(
            model_name='ldapconfig',
            name='http_api_attr_personal_photo',
            field=models.CharField(
                blank=True,
                help_text=(
                    'Path al campo con la foto del usuario en la respuesta '
                    '(notación de punto). Ej: '
                    '"personal_information.personal_photo". '
                    'Vacío = no sincronizar foto.'
                ),
                max_length=128,
            ),
        ),
        migrations.AddField(
            model_name='ldapconfig',
            name='http_api_email_template',
            field=models.CharField(
                blank=True,
                help_text=(
                    'Plantilla para sintetizar email cuando la API no lo devuelve. '
                    'Placeholders soportados: {username}. Ej: '
                    '"{username}@uho.edu.cu". '
                    'Vacío = no sintetizar (email puede quedar vacío).'
                ),
                max_length=128,
            ),
        ),
    ]
