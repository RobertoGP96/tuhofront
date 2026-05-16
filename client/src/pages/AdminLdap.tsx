import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { AlertTriangle, Lock, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { LdapDnListEditor } from '@/components/admin/LdapDnListEditor';
import { LdapGroupRoleMapEditor } from '@/components/admin/LdapGroupRoleMapEditor';
import { LdapTestPanel } from '@/components/admin/LdapTestPanel';
import { UhoIntegrationGuide } from '@/components/admin/UhoIntegrationGuide';
import {
  ldapService,
  type AuthProvider,
  type HttpApiMethod,
  type LdapConfig,
  type LdapGroupType,
  type LdapTlsRequireCert,
} from '@/services/ldap.service';
import { USER_TYPE_OPTIONS, type UserRole } from '@/types/auth.types';

const PROVIDER_OPTIONS: { value: AuthProvider; label: string; hint: string }[] = [
  {
    value: 'ldap',
    label: 'LDAP directo',
    hint: 'Conexión nativa LDAP/LDAPS contra el directorio (python-ldap)',
  },
  {
    value: 'http_api',
    label: 'API HTTP REST',
    hint: 'POST/GET contra un endpoint REST como https://auth.uho.edu.cu',
  },
];

const GROUP_TYPE_OPTIONS: { value: LdapGroupType; label: string }[] = [
  { value: 'GroupOfNamesType', label: 'groupOfNames' },
  { value: 'PosixGroupType', label: 'posixGroup' },
  { value: 'ActiveDirectoryGroupType', label: 'Active Directory group' },
  { value: 'NestedActiveDirectoryGroupType', label: 'Active Directory nested group' },
];

const TLS_REQUIRE_OPTIONS: { value: LdapTlsRequireCert; label: string }[] = [
  { value: 'never', label: 'never (NO usar en producción)' },
  { value: 'allow', label: 'allow' },
  { value: 'demand', label: 'demand (recomendado)' },
  { value: 'hard', label: 'hard' },
];

const HTTP_METHOD_OPTIONS: { value: HttpApiMethod; label: string }[] = [
  { value: 'POST', label: 'POST (recomendado)' },
  { value: 'GET', label: 'GET' },
];

export default function AdminLdap() {
  const [config, setConfig] = useState<LdapConfig | null>(null);
  const [original, setOriginal] = useState<LdapConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [headersDraft, setHeadersDraft] = useState('');
  // Tab activo (controlado para que la guía UHo pueda saltar al panel "Probar").
  const [activeTab, setActiveTab] = useState<string>('connection');

  const fetchConfig = useCallback(async () => {
    setLoading(true);
    try {
      const data = await ldapService.getConfig();
      setConfig(data);
      setOriginal(data);
      setHeadersDraft(JSON.stringify(data.http_api_extra_headers ?? {}, null, 2));
    } catch {
      toast.error('Error al cargar la configuración de autenticación externa');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchConfig();
  }, [fetchConfig]);

  const dirty = useMemo(
    () => JSON.stringify(config) !== JSON.stringify(original),
    [config, original],
  );

  if (loading || !config) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-9 w-72" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const update = <K extends keyof LdapConfig>(key: K, val: LdapConfig[K]) => {
    setConfig((prev) => (prev ? { ...prev, [key]: val } : prev));
  };

  const handleHeadersBlur = () => {
    try {
      const parsed = JSON.parse(headersDraft || '{}');
      if (typeof parsed !== 'object' || Array.isArray(parsed) || parsed === null) {
        throw new Error('debe ser un objeto JSON');
      }
      update('http_api_extra_headers', parsed as Record<string, string>);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'JSON inválido';
      toast.error(`http_api_extra_headers: ${message}`);
    }
  };

  const handleSave = async () => {
    if (!config) return;
    setSaving(true);
    try {
      const {
        id, last_test_at, last_test_ok, last_test_message,
        updated_at, updated_by, bind_password_present, http_api_token_present,
        ...patch
      } = config;
      void id; void last_test_at; void last_test_ok; void last_test_message;
      void updated_at; void updated_by; void bind_password_present; void http_api_token_present;
      const updated = await ldapService.updateConfig(patch);
      setConfig(updated);
      setOriginal(updated);
      setHeadersDraft(JSON.stringify(updated.http_api_extra_headers ?? {}, null, 2));
      toast.success('Configuración guardada');
    } catch (err) {
      const detail = err instanceof Error ? err.message : 'Error guardando';
      toast.error(detail);
    } finally {
      setSaving(false);
    }
  };

  const handleDiscard = () => {
    if (!original) return;
    setConfig(original);
    setHeadersDraft(JSON.stringify(original.http_api_extra_headers ?? {}, null, 2));
  };

  const isLdap = config.provider === 'ldap';
  const isHttpApi = config.provider === 'http_api';

  const secretMissing =
    config.enabled &&
    ((isLdap && !config.bind_password_present && config.bind_dn) ||
      (isHttpApi && false));

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <Lock className="text-primary-navy" size={28} />
          <div>
            <h1 className="text-3xl font-bold text-primary-navy">
              Autenticación externa
            </h1>
            <p className="text-gray-500 text-sm">
              Configura el proveedor de autenticación institucional. Opcional,
              configurable en runtime y extensible a nuevos proveedores.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {dirty && (
            <Button variant="outline" onClick={handleDiscard} disabled={saving}>
              Descartar
            </Button>
          )}
          <Button onClick={handleSave} disabled={saving || !dirty}>
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </Button>
        </div>
      </div>

      {/* Warning de secret ausente */}
      {secretMissing && (
        <div className="flex items-start gap-2 rounded-md border border-yellow-200 bg-yellow-50 px-3 py-2 text-sm text-yellow-900">
          <AlertTriangle size={18} className="mt-0.5 shrink-0" />
          <div>
            La autenticación está habilitada pero el secret en variable de
            entorno requerido no está presente. Define{' '}
            <code>LDAP_BIND_PASSWORD</code> en <code>.env</code> si usas bind
            autenticado.
          </div>
        </div>
      )}

      {/* Toggle global */}
      <Card className="border-gray-100 shadow-sm">
        <CardContent className="flex items-center justify-between gap-4 py-4">
          <div className="flex items-center gap-3">
            <ShieldCheck className="text-primary-navy" size={20} />
            <div>
              <div className="font-medium text-primary-navy">
                Autenticación externa {config.enabled ? 'habilitada' : 'deshabilitada'}
              </div>
              <p className="text-xs text-gray-500">
                Cuando está deshabilitada, el sistema autentica solo contra la
                base de datos local. No requiere reinicio del servidor.
              </p>
            </div>
          </div>
          <Checkbox
            checked={config.enabled}
            onCheckedChange={(v) => update('enabled', Boolean(v))}
          />
        </CardContent>
      </Card>

      {/* Selector de proveedor */}
      <Card className="border-gray-100 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base text-primary-navy">Proveedor</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {PROVIDER_OPTIONS.map((opt) => {
              const active = config.provider === opt.value;
              return (
                <button
                  type="button"
                  key={opt.value}
                  className={`text-left rounded-md border p-3 transition ${
                    active
                      ? 'border-primary-navy bg-primary-navy/5 ring-1 ring-primary-navy/40'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => update('provider', opt.value)}
                >
                  <div className="font-semibold text-sm text-primary-navy">
                    {opt.label}
                  </div>
                  <div className="text-xs text-gray-500">{opt.hint}</div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="connection">Conexión</TabsTrigger>
          <TabsTrigger value="search">
            {isLdap ? 'Búsqueda usuarios' : 'Petición y respuesta'}
          </TabsTrigger>
          {isLdap && <TabsTrigger value="groups">Grupos</TabsTrigger>}
          <TabsTrigger value="roles">Mapeo de roles</TabsTrigger>
          <TabsTrigger value="behavior">Comportamiento</TabsTrigger>
          <TabsTrigger value="test">Probar</TabsTrigger>
          {isHttpApi && <TabsTrigger value="uho">UHo</TabsTrigger>}
        </TabsList>

        {/* ---------------- Conexión ---------------- */}
        <TabsContent value="connection">
          {isLdap && (
            <Card className="border-gray-100 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base text-primary-navy">
                  Servidor LDAP
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="server_uri">URI del servidor</Label>
                  <Input
                    id="server_uri"
                    placeholder="ldaps://ldap.uho.edu.cu:636"
                    value={config.server_uri}
                    onChange={(e) => update('server_uri', e.target.value)}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Usa <code>ldaps://</code> para TLS directo, o{' '}
                    <code>ldap://</code> + StartTLS.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="flex items-center gap-2 mt-6">
                    <Checkbox
                      id="use_start_tls"
                      checked={config.use_start_tls}
                      onCheckedChange={(v) => update('use_start_tls', Boolean(v))}
                    />
                    <Label htmlFor="use_start_tls" className="cursor-pointer">
                      Usar StartTLS
                    </Label>
                  </div>
                  <div>
                    <Label htmlFor="connect_timeout">Timeout (segundos)</Label>
                    <Input
                      id="connect_timeout"
                      type="number"
                      min={1}
                      max={60}
                      value={config.connect_timeout}
                      onChange={(e) =>
                        update('connect_timeout', Number(e.target.value) || 5)
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="tls_require_cert">Validación cert. TLS</Label>
                    <Select
                      value={config.tls_require_cert}
                      onValueChange={(v) =>
                        update('tls_require_cert', v as LdapTlsRequireCert)
                      }
                    >
                      <SelectTrigger id="tls_require_cert">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TLS_REQUIRE_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="bind_dn">Bind DN</Label>
                  <Input
                    id="bind_dn"
                    placeholder="cn=tuho-app,ou=service-accounts,dc=uho,dc=edu,dc=cu"
                    value={config.bind_dn}
                    onChange={(e) => update('bind_dn', e.target.value)}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Usuario técnico que busca usuarios. Dejar vacío para bind
                    anónimo. La contraseña se configura vía variable de entorno{' '}
                    <code>LDAP_BIND_PASSWORD</code>{' '}
                    ({config.bind_password_present ? (
                      <span className="text-green-700 font-medium">presente</span>
                    ) : (
                      <span className="text-red-700 font-medium">no definida</span>
                    )}
                    ).
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {isHttpApi && (
            <Card className="border-gray-100 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base text-primary-navy">
                  Endpoint HTTP
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="md:col-span-2">
                    <Label htmlFor="http_api_base_url">URL base</Label>
                    <Input
                      id="http_api_base_url"
                      placeholder="https://auth.uho.edu.cu"
                      value={config.http_api_base_url}
                      onChange={(e) => update('http_api_base_url', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="http_api_login_path">Path login</Label>
                    <Input
                      id="http_api_login_path"
                      placeholder="/api/login"
                      value={config.http_api_login_path}
                      onChange={(e) => update('http_api_login_path', e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <Label htmlFor="http_api_method">Método HTTP</Label>
                    <Select
                      value={config.http_api_method}
                      onValueChange={(v) => update('http_api_method', v as HttpApiMethod)}
                    >
                      <SelectTrigger id="http_api_method">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {HTTP_METHOD_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="http_api_timeout">Timeout (segundos)</Label>
                    <Input
                      id="http_api_timeout"
                      type="number"
                      min={1}
                      max={120}
                      value={config.http_api_timeout}
                      onChange={(e) =>
                        update('http_api_timeout', Number(e.target.value) || 10)
                      }
                    />
                  </div>
                  <div className="flex items-center gap-2 mt-6">
                    <Checkbox
                      id="http_api_verify_ssl"
                      checked={config.http_api_verify_ssl}
                      onCheckedChange={(v) => update('http_api_verify_ssl', Boolean(v))}
                    />
                    <Label htmlFor="http_api_verify_ssl" className="cursor-pointer">
                      Verificar certificado TLS
                    </Label>
                  </div>
                </div>

                <div>
                  <Label htmlFor="http_api_extra_headers">Headers extra (JSON)</Label>
                  <Textarea
                    id="http_api_extra_headers"
                    rows={4}
                    placeholder='{"X-Tenant": "uho"}'
                    value={headersDraft}
                    onChange={(e) => setHeadersDraft(e.target.value)}
                    onBlur={handleHeadersBlur}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    No incluyas <code>Authorization</code>. Si el endpoint requiere
                    bearer token, define la variable de entorno{' '}
                    <code>EXTERNAL_AUTH_HTTP_API_TOKEN</code>{' '}
                    ({config.http_api_token_present ? (
                      <span className="text-green-700 font-medium">presente</span>
                    ) : (
                      <span className="text-gray-500">no definida</span>
                    )}
                    ).
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ---------------- Búsqueda / Mapeo ---------------- */}
        <TabsContent value="search">
          {isLdap && (
            <Card className="border-gray-100 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base text-primary-navy">
                  Búsqueda de usuarios y mapeo de atributos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="user_search_base">Base de búsqueda</Label>
                  <Input
                    id="user_search_base"
                    placeholder="ou=people,dc=uho,dc=edu,dc=cu"
                    value={config.user_search_base}
                    onChange={(e) => update('user_search_base', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="user_search_filter">Filtro</Label>
                  <Input
                    id="user_search_filter"
                    placeholder="(uid=%(user)s)"
                    value={config.user_search_filter}
                    onChange={(e) => update('user_search_filter', e.target.value)}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Debe contener exactamente un <code>%(user)s</code>.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                  <div>
                    <Label htmlFor="attr_username">Atributo username</Label>
                    <Input id="attr_username" value={config.attr_username}
                      onChange={(e) => update('attr_username', e.target.value)} />
                  </div>
                  <div>
                    <Label htmlFor="attr_email">Atributo email</Label>
                    <Input id="attr_email" value={config.attr_email}
                      onChange={(e) => update('attr_email', e.target.value)} />
                  </div>
                  <div>
                    <Label htmlFor="attr_first_name">Atributo first_name</Label>
                    <Input id="attr_first_name" value={config.attr_first_name}
                      onChange={(e) => update('attr_first_name', e.target.value)} />
                  </div>
                  <div>
                    <Label htmlFor="attr_last_name">Atributo last_name</Label>
                    <Input id="attr_last_name" value={config.attr_last_name}
                      onChange={(e) => update('attr_last_name', e.target.value)} />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="attr_id_card">
                      Atributo carnet de identidad (opcional)
                    </Label>
                    <Input id="attr_id_card" placeholder="employeeNumber"
                      value={config.attr_id_card}
                      onChange={(e) => update('attr_id_card', e.target.value)} />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {isHttpApi && (
            <div className="space-y-4">
              <Card className="border-gray-100 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base text-primary-navy">
                    Payload de la petición
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="http_api_username_field">
                        Campo del usuario en el body
                      </Label>
                      <Input id="http_api_username_field"
                        value={config.http_api_username_field}
                        onChange={(e) => update('http_api_username_field', e.target.value)} />
                    </div>
                    <div>
                      <Label htmlFor="http_api_password_field">
                        Campo del password en el body
                      </Label>
                      <Input id="http_api_password_field"
                        value={config.http_api_password_field}
                        onChange={(e) => update('http_api_password_field', e.target.value)} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-gray-100 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base text-primary-navy">
                    Mapeo de la respuesta JSON
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-xs text-gray-500">
                    Los paths usan notación de punto. Ej. si la respuesta es{' '}
                    <code>{`{"data":{"user":{"email":"..."}}}`}</code>,{' '}
                    <em>http_api_user_path</em> = <code>data.user</code> y{' '}
                    <em>http_api_attr_email</em> = <code>email</code>.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="http_api_success_field">
                        Campo de éxito (opcional)
                      </Label>
                      <Input id="http_api_success_field"
                        placeholder="ok, success, valid"
                        value={config.http_api_success_field}
                        onChange={(e) => update('http_api_success_field', e.target.value)} />
                      <p className="text-xs text-gray-500 mt-1">
                        Si vacío se usa el status HTTP (2xx = éxito).
                      </p>
                    </div>
                    <div>
                      <Label htmlFor="http_api_user_path">Path al objeto user</Label>
                      <Input id="http_api_user_path"
                        placeholder="user o data.user (vacío = raíz)"
                        value={config.http_api_user_path}
                        onChange={(e) => update('http_api_user_path', e.target.value)} />
                    </div>
                    <div>
                      <Label htmlFor="http_api_attr_username">Atributo username</Label>
                      <Input id="http_api_attr_username"
                        value={config.http_api_attr_username}
                        onChange={(e) => update('http_api_attr_username', e.target.value)} />
                    </div>
                    <div>
                      <Label htmlFor="http_api_attr_email">Atributo email</Label>
                      <Input id="http_api_attr_email"
                        value={config.http_api_attr_email}
                        onChange={(e) => update('http_api_attr_email', e.target.value)} />
                    </div>
                    <div>
                      <Label htmlFor="http_api_attr_first_name">Atributo first_name</Label>
                      <Input id="http_api_attr_first_name"
                        value={config.http_api_attr_first_name}
                        onChange={(e) => update('http_api_attr_first_name', e.target.value)} />
                    </div>
                    <div>
                      <Label htmlFor="http_api_attr_last_name">Atributo last_name</Label>
                      <Input id="http_api_attr_last_name"
                        value={config.http_api_attr_last_name}
                        onChange={(e) => update('http_api_attr_last_name', e.target.value)} />
                    </div>
                    <div>
                      <Label htmlFor="http_api_attr_id_card">
                        Atributo carnet (opcional)
                      </Label>
                      <Input id="http_api_attr_id_card"
                        value={config.http_api_attr_id_card}
                        onChange={(e) => update('http_api_attr_id_card', e.target.value)} />
                    </div>
                    <div>
                      <Label htmlFor="http_api_attr_personal_photo">
                        Atributo foto de perfil (opcional)
                      </Label>
                      <Input id="http_api_attr_personal_photo"
                        placeholder="personal_information.personal_photo"
                        value={config.http_api_attr_personal_photo}
                        onChange={(e) => update('http_api_attr_personal_photo', e.target.value)} />
                      <p className="text-xs text-gray-500 mt-1">
                        Soporta paths anidados con notación de punto. Vacío = no sincronizar foto.
                      </p>
                    </div>
                    <div>
                      <Label htmlFor="http_api_groups_path">Path a grupos/roles</Label>
                      <Input id="http_api_groups_path"
                        placeholder="roles, user.groups (vacío = no sync)"
                        value={config.http_api_groups_path}
                        onChange={(e) => update('http_api_groups_path', e.target.value)} />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="http_api_email_template">
                        Plantilla de email (opcional)
                      </Label>
                      <Input id="http_api_email_template"
                        placeholder="{username}@uho.edu.cu"
                        value={config.http_api_email_template}
                        onChange={(e) => update('http_api_email_template', e.target.value)} />
                      <p className="text-xs text-gray-500 mt-1">
                        Si la API no devuelve email, se sintetiza con esta plantilla.
                        Placeholder soportado: <code>{'{username}'}</code>.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* ---------------- Grupos LDAP ---------------- */}
        {isLdap && (
          <TabsContent value="groups">
            <Card className="border-gray-100 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base text-primary-navy">
                  Búsqueda de grupos LDAP
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="group_search_base">Base de búsqueda</Label>
                  <Input id="group_search_base"
                    placeholder="ou=groups,dc=uho,dc=edu,dc=cu"
                    value={config.group_search_base}
                    onChange={(e) => update('group_search_base', e.target.value)} />
                  <p className="text-xs text-gray-500 mt-1">
                    Vacío para deshabilitar la sincronización de grupos.
                  </p>
                </div>
                <div>
                  <Label htmlFor="group_search_filter">Filtro</Label>
                  <Input id="group_search_filter"
                    placeholder="(objectClass=groupOfNames)"
                    value={config.group_search_filter}
                    onChange={(e) => update('group_search_filter', e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="group_type">Tipo de grupo</Label>
                  <Select value={config.group_type}
                    onValueChange={(v) => update('group_type', v as LdapGroupType)}>
                    <SelectTrigger id="group_type"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {GROUP_TYPE_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* ---------------- Mapeo de roles (común) ---------------- */}
        <TabsContent value="roles">
          <Card className="border-gray-100 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base text-primary-navy">
                Grupo / rol externo → rol de TUho
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="block mb-2">Rol por defecto</Label>
                <Select value={config.default_role}
                  onValueChange={(v) => update('default_role', v as UserRole)}>
                  <SelectTrigger className="w-64"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {USER_TYPE_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500 mt-1">
                  Asignado si el usuario no pertenece a ningún grupo mapeado.
                </p>
              </div>

              <div>
                <h3 className="text-sm font-semibold mb-2 text-primary-navy">
                  Mapeos
                </h3>
                <p className="text-xs text-gray-500 mb-2">
                  Para <strong>LDAP</strong>, la clave es el DN completo del grupo.
                  Para <strong>HTTP API</strong>, es el nombre del rol/grupo tal
                  como aparece en el array configurado en{' '}
                  <code>http_api_groups_path</code>.
                </p>
                <LdapGroupRoleMapEditor
                  value={config.group_to_role_map}
                  onChange={(next) => update('group_to_role_map', next)}
                />
              </div>

              <div>
                <h3 className="text-sm font-semibold mb-2 text-primary-navy">
                  Grupos que otorgan <code>is_staff</code>
                </h3>
                <LdapDnListEditor
                  value={config.make_staff_groups}
                  onChange={(next) => update('make_staff_groups', next)}
                />
              </div>

              <div>
                <h3 className="text-sm font-semibold mb-2 text-primary-navy">
                  Grupos que otorgan <code>is_superuser</code>
                </h3>
                <LdapDnListEditor
                  value={config.make_superuser_groups}
                  onChange={(next) => update('make_superuser_groups', next)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ---------------- Comportamiento (común) ---------------- */}
        <TabsContent value="behavior">
          <Card className="border-gray-100 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base text-primary-navy">
                Comportamiento
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <label className="flex items-start gap-2 cursor-pointer">
                <Checkbox
                  className="mt-1"
                  checked={config.auto_create_users}
                  onCheckedChange={(v) => update('auto_create_users', Boolean(v))}
                />
                <div>
                  <div className="font-medium text-sm">
                    Auto-crear usuarios en primer login
                  </div>
                  <p className="text-xs text-gray-500">
                    Si está deshabilitado, los usuarios deben existir
                    previamente en la BD local.
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-2 cursor-pointer">
                <Checkbox
                  className="mt-1"
                  checked={config.fallback_to_local}
                  onCheckedChange={(v) => update('fallback_to_local', Boolean(v))}
                />
                <div>
                  <div className="font-medium text-sm">
                    Fallback a autenticación local
                  </div>
                  <p className="text-xs text-gray-500">
                    Si el proveedor falla, intentar autenticar contra la BD.
                    Recomendado para evitar lockouts si el proveedor cae.
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-2 cursor-pointer">
                <Checkbox
                  className="mt-1"
                  checked={config.sync_on_login}
                  onCheckedChange={(v) => update('sync_on_login', Boolean(v))}
                />
                <div>
                  <div className="font-medium text-sm">
                    Sincronizar atributos y grupos en cada login
                  </div>
                  <p className="text-xs text-gray-500">
                    Actualiza nombre, email y rol según el proveedor cuando el
                    usuario inicia sesión.
                  </p>
                </div>
              </label>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ---------------- Test ---------------- */}
        <TabsContent value="test">
          <LdapTestPanel config={config} onTestComplete={() => void fetchConfig()} />
        </TabsContent>

        {/* ---------------- UHo (interactive guide) ---------------- */}
        {isHttpApi && (
          <TabsContent value="uho">
            <UhoIntegrationGuide
              config={config}
              onApplyDefaults={(patch) => {
                // Aplica el parche al state local; el usuario aún debe pulsar
                // "Guardar cambios" arriba para persistirlo.
                setConfig((prev) => (prev ? { ...prev, ...patch } : prev));
                if (patch.http_api_extra_headers !== undefined) {
                  setHeadersDraft(
                    JSON.stringify(patch.http_api_extra_headers ?? {}, null, 2),
                  );
                }
              }}
              onJumpToTab={setActiveTab}
            />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
