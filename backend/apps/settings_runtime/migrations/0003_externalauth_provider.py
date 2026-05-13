"""Add provider field and HTTP API provider config fields to LdapConfig."""
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('settings_runtime', '0002_ldapconfig'),
    ]

    operations = [
        migrations.AddField(
            model_name='ldapconfig',
            name='provider',
            field=models.CharField(
                choices=[
                    ('ldap', 'LDAP directo (python-ldap)'),
                    ('http_api', 'API HTTP REST'),
                ],
                default='ldap',
                help_text='Proveedor de autenticación externa a usar',
                max_length=20,
            ),
        ),
        migrations.AlterField(
            model_name='ldapconfig',
            name='enabled',
            field=models.BooleanField(default=False, help_text='Habilitar autenticación externa'),
        ),
        migrations.AlterField(
            model_name='ldapconfig',
            name='group_to_role_map',
            field=models.JSONField(
                blank=True,
                default=dict,
                help_text=(
                    'Diccionario {"<grupo>": "<user_type>"}. Para LDAP la clave es el '
                    'DN completo; para HTTP API es el nombre del rol/grupo devuelto '
                    'por el endpoint. Ej. LDAP: {"cn=profesores,ou=groups,dc=uho,'
                    'dc=edu,dc=cu": "PROFESOR"}. Ej. HTTP: {"profesor": "PROFESOR", '
                    '"estudiante": "ESTUDIANTE"}.'
                ),
            ),
        ),
        # === HTTP API fields ===
        migrations.AddField(
            model_name='ldapconfig',
            name='http_api_base_url',
            field=models.CharField(blank=True, help_text='Ej: https://auth.uho.edu.cu', max_length=255),
        ),
        migrations.AddField(
            model_name='ldapconfig',
            name='http_api_login_path',
            field=models.CharField(default='/api/login', help_text='Path del endpoint de login (relativo a base_url)', max_length=255),
        ),
        migrations.AddField(
            model_name='ldapconfig',
            name='http_api_method',
            field=models.CharField(choices=[('POST', 'POST'), ('GET', 'GET')], default='POST', max_length=10),
        ),
        migrations.AddField(
            model_name='ldapconfig',
            name='http_api_username_field',
            field=models.CharField(default='username', help_text='Nombre del campo en el body de la petición que lleva el usuario', max_length=64),
        ),
        migrations.AddField(
            model_name='ldapconfig',
            name='http_api_password_field',
            field=models.CharField(default='password', help_text='Nombre del campo en el body de la petición que lleva el password', max_length=64),
        ),
        migrations.AddField(
            model_name='ldapconfig',
            name='http_api_extra_headers',
            field=models.JSONField(
                blank=True,
                default=dict,
                help_text=(
                    'Headers adicionales para la petición. Ej: {"X-Tenant": "uho"}. '
                    'NO incluir aquí tokens — usar la var de entorno '
                    'EXTERNAL_AUTH_HTTP_API_TOKEN (se envía como Authorization: Bearer).'
                ),
            ),
        ),
        migrations.AddField(
            model_name='ldapconfig',
            name='http_api_verify_ssl',
            field=models.BooleanField(default=True, help_text='Verificar el certificado TLS del servidor remoto'),
        ),
        migrations.AddField(
            model_name='ldapconfig',
            name='http_api_timeout',
            field=models.PositiveSmallIntegerField(default=10, help_text='Timeout (segundos) de la petición HTTP'),
        ),
        migrations.AddField(
            model_name='ldapconfig',
            name='http_api_success_field',
            field=models.CharField(
                blank=True,
                help_text=(
                    'Path opcional a un campo booleano de éxito. Si vacío, se usa '
                    'el código de estado HTTP (2xx = éxito).'
                ),
                max_length=255,
            ),
        ),
        migrations.AddField(
            model_name='ldapconfig',
            name='http_api_user_path',
            field=models.CharField(
                blank=True,
                help_text=(
                    'Path al objeto user dentro del JSON de respuesta '
                    '(vacío = raíz). Ej: "user" o "data.user".'
                ),
                max_length=255,
            ),
        ),
        migrations.AddField(
            model_name='ldapconfig',
            name='http_api_attr_username',
            field=models.CharField(default='username', max_length=64),
        ),
        migrations.AddField(
            model_name='ldapconfig',
            name='http_api_attr_email',
            field=models.CharField(default='email', max_length=64),
        ),
        migrations.AddField(
            model_name='ldapconfig',
            name='http_api_attr_first_name',
            field=models.CharField(default='first_name', max_length=64),
        ),
        migrations.AddField(
            model_name='ldapconfig',
            name='http_api_attr_last_name',
            field=models.CharField(default='last_name', max_length=64),
        ),
        migrations.AddField(
            model_name='ldapconfig',
            name='http_api_attr_id_card',
            field=models.CharField(blank=True, max_length=64),
        ),
        migrations.AddField(
            model_name='ldapconfig',
            name='http_api_groups_path',
            field=models.CharField(
                blank=True,
                help_text=(
                    'Path a la lista de grupos/roles en la respuesta. '
                    'Ej: "roles", "user.groups". Vacío = no se sincronizan grupos.'
                ),
                max_length=255,
            ),
        ),
    ]
