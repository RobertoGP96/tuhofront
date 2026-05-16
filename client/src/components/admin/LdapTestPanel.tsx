import { useState } from 'react';
import { toast } from 'sonner';
import { AlertCircle, CheckCircle2, PlayCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  ldapService,
  type ExtractedAttrs,
  type LdapConfig,
  type LdapTestRequest,
  type LdapTestResponse,
} from '@/services/ldap.service';
import { USER_TYPE_OPTIONS, type UserRole } from '@/types/auth.types';

interface LdapTestPanelProps {
  config: LdapConfig;
  onTestComplete?: (result: LdapTestResponse) => void;
}

/**
 * Panel para probar la conexión del proveedor de autenticación externa
 * actualmente configurado. Se adapta al `provider` activo:
 *
 * - **LDAP**: muestra usuario de prueba + override opcional del bind password
 *   y, tras ejecutar, renderiza DN del usuario y lista de grupos LDAP.
 * - **HTTP API**: muestra usuario + password real, overrides opcionales para
 *   `http_api_base_url` y `http_api_login_path`, y al terminar muestra los
 *   atributos extraídos (incluida la foto de perfil) y el rol resuelto.
 *
 * El panel comparte el mismo endpoint backend (`POST /settings/ldap/test/`),
 * por lo que el comportamiento del lado servidor depende del `provider`
 * activo en `LdapConfig`.
 */
export function LdapTestPanel({ config, onTestComplete }: LdapTestPanelProps) {
  const isLdap = config.provider === 'ldap';
  const isHttpApi = config.provider === 'http_api';

  const [testUsername, setTestUsername] = useState('');
  const [testPassword, setTestPassword] = useState('');
  // LDAP-only override
  const [bindPasswordOverride, setBindPasswordOverride] = useState('');
  // HTTP-API-only overrides
  const [baseUrlOverride, setBaseUrlOverride] = useState('');
  const [loginPathOverride, setLoginPathOverride] = useState('');

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<LdapTestResponse | null>(null);

  const handleTest = async () => {
    setLoading(true);
    setResult(null);
    try {
      const payload: LdapTestRequest = {
        test_username: testUsername.trim() || undefined,
      };
      if (isLdap) {
        // Si el usuario no introduce password, el endpoint cae al
        // LDAP_BIND_PASSWORD del entorno para el bind técnico.
        payload.bind_password = bindPasswordOverride.trim() || undefined;
      }
      if (isHttpApi) {
        // El password aquí es la credencial real del usuario contra la API.
        payload.test_password = testPassword.trim() || undefined;
        if (baseUrlOverride.trim()) {
          payload.http_api_base_url = baseUrlOverride.trim();
        }
        if (loginPathOverride.trim()) {
          payload.http_api_login_path = loginPathOverride.trim();
        }
      }

      const response = await ldapService.testConnection(payload);
      setResult(response);
      onTestComplete?.(response);
      if (response.ok) {
        toast.success('Prueba de autenticación exitosa');
      } else {
        toast.error('La prueba de autenticación falló');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al probar conexión';
      toast.error(message);
      setResult({
        ok: false,
        message,
        details: {},
        bind_ok: false,
        user_dn: null,
        user_attrs: null,
        groups: [],
      });
    } finally {
      setLoading(false);
    }
  };

  const lastTestAt = config.last_test_at
    ? new Date(config.last_test_at).toLocaleString('es-ES')
    : null;

  const disableButton =
    loading ||
    (isLdap && !config.server_uri) ||
    (isHttpApi && !config.http_api_base_url);

  return (
    <Card className="border-gray-100 shadow-sm">
      <CardHeader>
        <CardTitle className="text-base text-primary-navy flex items-center gap-2">
          <PlayCircle size={18} />
          Probar conexión
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLdap && (
          <p className="text-sm text-gray-600">
            Verifica que el servidor LDAP responde y que el bind funciona.
            Opcionalmente busca un usuario para validar el filtro y los grupos.
          </p>
        )}
        {isHttpApi && (
          <p className="text-sm text-gray-600">
            Envía las credenciales contra el endpoint configurado
            (<code>{config.http_api_base_url || '(sin base_url)'}</code>
            <code>{config.http_api_login_path || ''}</code>) y muestra los
            atributos extraídos del JSON de respuesta tal como se mapearían
            al modelo de usuario local.
          </p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <Label htmlFor="test-username">
              Usuario {isHttpApi ? '' : '(opcional)'}
            </Label>
            <Input
              id="test-username"
              placeholder={isHttpApi ? 'ej: cmorenot' : 'ej: jdoe'}
              value={testUsername}
              onChange={(e) => setTestUsername(e.target.value)}
              autoComplete="username"
            />
          </div>
          {isHttpApi && (
            <div>
              <Label htmlFor="test-password">Contraseña del usuario</Label>
              <Input
                id="test-password"
                type="password"
                placeholder="contraseña real del usuario"
                value={testPassword}
                onChange={(e) => setTestPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>
          )}
          {isLdap && (
            <div>
              <Label htmlFor="bind-password">
                Override de bind password (opcional)
              </Label>
              <Input
                id="bind-password"
                type="password"
                placeholder="usa LDAP_BIND_PASSWORD si vacío"
                value={bindPasswordOverride}
                onChange={(e) => setBindPasswordOverride(e.target.value)}
                autoComplete="new-password"
              />
            </div>
          )}
        </div>

        {isHttpApi && (
          <details className="text-sm">
            <summary className="cursor-pointer text-gray-600 hover:text-gray-900">
              Overrides avanzados (no se guardan)
            </summary>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3">
              <div>
                <Label htmlFor="override-base-url">http_api_base_url</Label>
                <Input
                  id="override-base-url"
                  placeholder={config.http_api_base_url || 'https://auth.uho.edu.cu'}
                  value={baseUrlOverride}
                  onChange={(e) => setBaseUrlOverride(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="override-login-path">http_api_login_path</Label>
                <Input
                  id="override-login-path"
                  placeholder={config.http_api_login_path || '/api/login'}
                  value={loginPathOverride}
                  onChange={(e) => setLoginPathOverride(e.target.value)}
                />
              </div>
            </div>
          </details>
        )}

        <Button onClick={handleTest} disabled={disableButton}>
          {loading ? 'Probando...' : 'Probar conexión'}
        </Button>

        {result && (
          <ResultBlock result={result} config={config} />
        )}

        {lastTestAt && (
          <p className="text-xs text-gray-500">
            Último test guardado: {lastTestAt}{' '}
            {config.last_test_ok === true
              ? '✓ ok'
              : config.last_test_ok === false
                ? '✗ fallo'
                : ''}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------- result block

interface ResultBlockProps {
  result: LdapTestResponse;
  config: LdapConfig;
}

function ResultBlock({ result, config }: ResultBlockProps) {
  const tone = result.ok
    ? 'border-green-200 bg-green-50 text-green-900'
    : 'border-red-200 bg-red-50 text-red-900';

  const isHttpApi = config.provider === 'http_api';
  const isLdap = config.provider === 'ldap';
  const groups = (result.groups ?? result.extracted?.groups ?? []) as string[];

  // Calcular el rol que se asignaría según group_to_role_map / default_role.
  const resolvedRole: UserRole = (() => {
    const map = config.group_to_role_map || {};
    const lowerGroups = groups.map((g) => g.toLowerCase());
    for (const [key, role] of Object.entries(map)) {
      if (lowerGroups.includes(key.toLowerCase())) {
        return role as UserRole;
      }
    }
    return config.default_role;
  })();

  return (
    <div className={`rounded-md border p-3 text-sm space-y-3 ${tone}`}>
      <div className="flex items-start gap-2">
        {result.ok ? (
          <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
        ) : (
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
        )}
        <div className="flex-1 min-w-0">
          <div className="font-medium">
            {result.ok ? 'Éxito' : 'Error'}: {result.message}
          </div>
          {typeof result.status === 'number' && (
            <div className="text-xs mt-1">
              HTTP {result.status}
              {typeof result.details?.url === 'string'
                ? ` · ${result.details.url}`
                : ''}
            </div>
          )}
        </div>
      </div>

      {/* LDAP — info clásica */}
      {isLdap && result.user_dn && (
        <div className="text-xs">
          <strong>Usuario:</strong> <code>{result.user_dn}</code>
        </div>
      )}

      {/* HTTP API — tabla de atributos extraídos */}
      {isHttpApi && result.extracted && (
        <ExtractedAttrsTable extracted={result.extracted} />
      )}

      {/* Grupos resueltos (común a LDAP y HTTP API) */}
      {groups.length > 0 && (
        <div className="text-xs">
          <strong>Grupos ({groups.length}):</strong>
          <ul className="list-disc pl-5 mt-1 space-y-0.5">
            {groups.map((g) => (
              <li key={g}>
                <code className="break-all">{g}</code>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Rol resuelto — solo si autenticación fue OK */}
      {result.ok && (isHttpApi || groups.length > 0) && (
        <div className="text-xs">
          <strong>Rol asignado:</strong>{' '}
          <span className="px-2 py-0.5 bg-white/60 rounded font-mono">
            {USER_TYPE_OPTIONS.find((o) => o.value === resolvedRole)?.label ?? resolvedRole}
          </span>
        </div>
      )}

      {/* JSON crudo (plegable) */}
      <details className="text-xs">
        <summary className="cursor-pointer">Detalles técnicos (JSON)</summary>
        <pre className="mt-2 max-h-64 overflow-auto rounded bg-white/80 p-2 text-xs">
          {JSON.stringify(result.details ?? {}, null, 2)}
        </pre>
      </details>
    </div>
  );
}

// ------------------------------------------------------- extracted attrs table

interface ExtractedAttrsTableProps {
  extracted: ExtractedAttrs;
}

function ExtractedAttrsTable({ extracted }: ExtractedAttrsTableProps) {
  const rows: { label: string; value: string | undefined; isPhoto?: boolean }[] = [
    { label: 'username', value: extracted.username },
    { label: 'email', value: extracted.email },
    { label: 'first_name', value: extracted.first_name },
    { label: 'last_name', value: extracted.last_name },
    { label: 'id_card', value: extracted.id_card },
    { label: 'personal_photo', value: extracted.personal_photo, isPhoto: true },
  ];

  return (
    <div className="text-xs">
      <strong>Atributos extraídos:</strong>
      <table className="mt-1 w-full border-collapse">
        <tbody>
          {rows.map((row) => (
            <tr key={row.label} className="border-b border-white/60 last:border-0">
              <td className="py-1 pr-3 font-mono text-gray-700 align-top w-1/3">
                {row.label}
              </td>
              <td className="py-1 align-top">
                {row.value ? (
                  row.isPhoto ? (
                    <div className="flex items-center gap-2">
                      <img
                        src={row.value}
                        alt="avatar preview"
                        className="h-12 w-12 rounded object-cover border border-white"
                      />
                      <code className="text-xs break-all text-gray-600">
                        {row.value.length > 60
                          ? `${row.value.slice(0, 60)}… (${row.value.length} chars)`
                          : row.value}
                      </code>
                    </div>
                  ) : (
                    <code className="break-all">{row.value}</code>
                  )
                ) : (
                  <em className="text-gray-500">(vacío)</em>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
