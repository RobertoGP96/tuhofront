"""Sincroniza usuarios desde el directorio LDAP a la BD local.

Solo aplica cuando el proveedor activo es `provider='ldap'`. Para HTTP API
la sincronización masiva no aplica en la mayoría de casos (la API se
consulta on-demand al hacer login), pero podría añadirse un endpoint
"list users" provider-específico si la institución lo expone.

Recorre el `user_search_base` configurado en `LdapConfig` aplicando
`user_search_filter` con `%(user)s` reemplazado por `*`. Para cada
entrada encontrada llama al backend para crear/actualizar el `User` local.

Útil como bootstrap inicial al activar LDAP. En operación normal los
usuarios se crean en su primer login.

Ejemplos:
    python manage.py sync_ldap_users --dry-run
    python manage.py sync_ldap_users --limit 50
"""
from __future__ import annotations

import os

from django.core.management.base import BaseCommand, CommandError

from apps.settings_runtime.models import LdapConfig


class Command(BaseCommand):
    help = 'Sincroniza usuarios LDAP en la BD local (idempotente).'

    def add_arguments(self, parser):
        parser.add_argument('--dry-run', action='store_true',
                            help='No persistir; solo listar usuarios encontrados.')
        parser.add_argument('--limit', type=int, default=0,
                            help='Máximo de usuarios a procesar (0 = sin límite).')

    def handle(self, *args, **opts):
        cfg = LdapConfig.load()
        if not cfg.enabled:
            raise CommandError('Autenticación externa no está habilitada (enabled=False).')
        if cfg.provider != LdapConfig.PROVIDER_LDAP:
            raise CommandError(
                f'Este comando solo aplica para provider=ldap. '
                f'Provider actual: {cfg.provider}.'
            )
        if not cfg.server_uri or not cfg.user_search_base:
            raise CommandError('Faltan campos LDAP: server_uri y user_search_base.')

        try:
            import ldap as pyldap  # type: ignore
        except ImportError:
            raise CommandError(
                'python-ldap no está instalado. Instálelo antes de ejecutar este comando.'
            )

        from apps.platform.auth.providers import get_provider
        from apps.platform.auth.ldap import RuntimeLdapBackend
        from apps.platform.auth.providers.ldap import _decode_attrs, _first

        ldap_provider = get_provider(cfg)
        if ldap_provider is None:
            raise CommandError('No se pudo instanciar el proveedor LDAP.')

        # Búsqueda masiva
        search_filter = cfg.user_search_filter.replace('%(user)s', '*')
        conn = pyldap.initialize(cfg.server_uri)
        conn.set_option(pyldap.OPT_REFERRALS, 0)
        conn.set_option(pyldap.OPT_NETWORK_TIMEOUT, cfg.connect_timeout)
        try:
            if cfg.use_start_tls:
                conn.start_tls_s()
            if cfg.bind_dn:
                conn.simple_bind_s(cfg.bind_dn, os.getenv('LDAP_BIND_PASSWORD', ''))
            else:
                conn.simple_bind_s()
            results = conn.search_s(
                cfg.user_search_base,
                pyldap.SCOPE_SUBTREE,
                search_filter,
                attrlist=[
                    cfg.attr_username, cfg.attr_email,
                    cfg.attr_first_name, cfg.attr_last_name,
                    cfg.attr_id_card,
                ] if cfg.attr_id_card else [
                    cfg.attr_username, cfg.attr_email,
                    cfg.attr_first_name, cfg.attr_last_name,
                ],
            )
        finally:
            try:
                conn.unbind_s()
            except Exception:
                pass

        limit = opts.get('limit') or 0
        dry_run = bool(opts.get('dry_run'))

        backend = RuntimeLdapBackend()
        processed = created = updated = 0

        from apps.platform.models.user import User
        from apps.platform.auth.providers.base import AuthResult

        for dn, raw_attrs in results:
            if limit and processed >= limit:
                break
            attrs = _decode_attrs(raw_attrs)
            username = _first(attrs, cfg.attr_username)
            if not username:
                continue
            processed += 1

            if dry_run:
                self.stdout.write(f'[dry-run] {username} ({dn})')
                continue

            result = AuthResult(
                username=username,
                email=_first(attrs, cfg.attr_email),
                first_name=_first(attrs, cfg.attr_first_name),
                last_name=_first(attrs, cfg.attr_last_name),
                id_card=_first(attrs, cfg.attr_id_card) if cfg.attr_id_card else '',
                groups=[],
                raw={'dn': dn, 'attrs': attrs},
            )
            existed = User.objects.filter(username=username).exists()
            user = backend._resolve_user(result, cfg)
            if user is None:
                self.stdout.write(self.style.WARNING(
                    f'No se pudo sincronizar {username} (auto_create_users=False y no existe)'
                ))
                continue
            if existed:
                updated += 1
            else:
                created += 1

        self.stdout.write(self.style.SUCCESS(
            f'Procesados: {processed} (dry-run={dry_run}, creados={created}, actualizados={updated})'
        ))
