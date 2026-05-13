"""Add LdapConfig singleton model for optional LDAP authentication."""
from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('settings_runtime', '0001_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='LdapConfig',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('enabled', models.BooleanField(default=False, help_text='Habilitar autenticación LDAP')),
                ('server_uri', models.CharField(blank=True, help_text='Ej: ldap://host:389 o ldaps://host:636', max_length=255)),
                ('use_start_tls', models.BooleanField(default=False, help_text='Negociar StartTLS sobre conexión ldap:// (no usar con ldaps://)')),
                ('connect_timeout', models.PositiveSmallIntegerField(default=5, help_text='Timeout de red en segundos')),
                ('tls_require_cert', models.CharField(
                    choices=[
                        ('never', 'never (NO usar en producción)'),
                        ('allow', 'allow'),
                        ('demand', 'demand (recomendado)'),
                        ('hard', 'hard'),
                    ],
                    default='demand',
                    help_text='Política de validación de certificado TLS',
                    max_length=10,
                )),
                ('bind_dn', models.CharField(blank=True, help_text='DN del usuario técnico que busca usuarios. Vacío = bind anónimo', max_length=255)),
                ('user_search_base', models.CharField(blank=True, help_text='Ej: ou=people,dc=uho,dc=edu,dc=cu', max_length=255)),
                ('user_search_filter', models.CharField(default='(uid=%(user)s)', help_text='Filtro LDAP; %(user)s se reemplaza por el username', max_length=255)),
                ('attr_username', models.CharField(default='uid', max_length=64)),
                ('attr_email', models.CharField(default='mail', max_length=64)),
                ('attr_first_name', models.CharField(default='givenName', max_length=64)),
                ('attr_last_name', models.CharField(default='sn', max_length=64)),
                ('attr_id_card', models.CharField(blank=True, help_text='Atributo LDAP que contiene el carnet de identidad (opcional)', max_length=64)),
                ('group_search_base', models.CharField(blank=True, max_length=255)),
                ('group_search_filter', models.CharField(default='(objectClass=groupOfNames)', max_length=255)),
                ('group_type', models.CharField(
                    choices=[
                        ('GroupOfNamesType', 'groupOfNames'),
                        ('PosixGroupType', 'posixGroup'),
                        ('ActiveDirectoryGroupType', 'AD group'),
                        ('NestedActiveDirectoryGroupType', 'AD nested group'),
                    ],
                    default='GroupOfNamesType',
                    max_length=64,
                )),
                ('group_to_role_map', models.JSONField(blank=True, default=dict, help_text='Diccionario {"<dn_grupo>": "<user_type>"}. Ej: {"cn=profesores,ou=groups,dc=uho,dc=edu,dc=cu": "PROFESOR"}')),
                ('default_role', models.CharField(
                    choices=[
                        ('ADMIN', 'Administrador'),
                        ('SECRETARIA_DOCENTE', 'Secretaría Docente'),
                        ('GESTOR_INTERNO', 'Gestor Interno'),
                        ('GESTOR_TRAMITES', 'Gestor de Trámites'),
                        ('GESTOR_RESERVAS', 'Gestor de Reservas'),
                        ('PROFESOR', 'Profesor'),
                        ('TRABAJADOR', 'Trabajador'),
                        ('ESTUDIANTE', 'Estudiante'),
                        ('EXTERNO', 'Externo'),
                    ],
                    default='EXTERNO',
                    help_text='user_type asignado si ningún grupo coincide',
                    max_length=20,
                )),
                ('make_staff_groups', models.JSONField(blank=True, default=list, help_text='Lista de DN de grupos cuyos miembros obtienen is_staff=True')),
                ('make_superuser_groups', models.JSONField(blank=True, default=list, help_text='Lista de DN de grupos cuyos miembros obtienen is_superuser=True')),
                ('auto_create_users', models.BooleanField(default=True, help_text='Crear usuario local en el primer login LDAP exitoso')),
                ('fallback_to_local', models.BooleanField(default=True, help_text='Si LDAP falla o no autentica, intentar autenticar contra BD local')),
                ('sync_on_login', models.BooleanField(default=True, help_text='Sincronizar atributos LDAP → User en cada login exitoso')),
                ('last_test_at', models.DateTimeField(blank=True, null=True)),
                ('last_test_ok', models.BooleanField(blank=True, null=True)),
                ('last_test_message', models.TextField(blank=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('updated_by', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='+', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'verbose_name': 'Configuración LDAP',
                'verbose_name_plural': 'Configuración LDAP',
            },
        ),
    ]
