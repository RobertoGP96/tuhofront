import { useMemo } from 'react';
import { toast } from 'sonner';
import { AlertTriangle, CheckCircle2, ExternalLink, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { LdapConfig } from '@/services/ldap.service';
import type { UserRole } from '@/types/auth.types';

/**
 * Guía interactiva para configurar la integración con `auth.uho.edu.cu`.
 *
 * Renderiza:
 * - Un ejemplo de la respuesta real (con foto truncada).
 * - La tabla de mapeo recomendada response → User.
 * - Un botón "Aplicar valores recomendados" que rellena el formulario padre.
 * - Un diagnóstico campo a campo (✓ / ⚠) comparando con la configuración actual.
 * - Un atajo para saltar al panel "Probar".
 */
interface UhoIntegrationGuideProps {
  /** Configuración actual leída del backend. */
  config: LdapConfig;
  /** Aplica un parche al state local del padre (no persiste). */
  onApplyDefaults: (patch: Partial<LdapConfig>) => void;
  /** Cambia el tab activo del padre. Recibe `'test'` cuando el usuario quiere ir a probar. */
  onJumpToTab?: (tab: string) => void;
}

// Valores recomendados para auth.uho.edu.cu. Si la institución cambia el
// endpoint o el shape, basta con editar esta constante.
const UHO_DEFAULTS: Partial<LdapConfig> = {
  http_api_base_url: 'https://auth.uho.edu.cu',
  http_api_login_path: '/api/login',
  http_api_method: 'POST',
  http_api_username_field: 'username',
  http_api_password_field: 'password',
  http_api_success_field: 'OK',
  http_api_user_path: 'activeUser',
  http_api_attr_username: 'uid',
  http_api_attr_email: '',
  http_api_attr_first_name: 'personal_information.given_name',
  http_api_attr_last_name: 'personal_information.sn',
  http_api_attr_id_card: 'personal_information.dni',
  http_api_attr_personal_photo: 'personal_information.personal_photo',
  http_api_groups_path: 'activeUser.account_info.user_type',
  http_api_email_template: '{username}@uho.edu.cu',
  group_to_role_map: {
    Trabajador: 'USUARIO' as UserRole,
    Estudiante: 'USUARIO' as UserRole,
  },
  default_role: 'USUARIO' as UserRole,
  http_api_verify_ssl: true,
};

// Ejemplo abreviado de la respuesta — foto truncada para no romper el layout.
const SAMPLE_RESPONSE = `{
  "OK": true,
  "activeUser": {
    "status": 200,
    "account_state": "TRUE",
    "uid": "cmorenot",
    "personal_information": {
      "dni": "94061342900",
      "cn": "CARLOS EMILIO MORENO TEJEDA",
      "given_name": "CARLOS EMILIO",
      "sn": "MORENO TEJEDA",
      "personal_photo": "data:image/png;base64,iVBORw0KGgoAAA…",
      "overlapping": ""
    },
    "account_info": {
      "user_type": "Trabajador",
      "create_user": "Marilin Velázquez Marrero [mvelazquezm]",
      "create_date": "2018-09-05 09:13:43",
      "modify_user": "AGA-CLI",
      "modify_data": "2026-04-29 07:19:52 pm",
      "accept_system_policies": true,
      "password": {
        "user_password_set": "2026-03-31 08:51:14 am",
        "pass_valid": "Valido",
        "pass_set": "46"
      }
    }
  },
  "message": "Inició sesión"
}`;

const MAPPING_ROWS: { json: string; userField: string; note?: string }[] = [
  { json: 'activeUser.uid', userField: 'User.username', note: 'Login único institucional' },
  { json: 'activeUser.personal_information.given_name', userField: 'User.first_name' },
  { json: 'activeUser.personal_information.sn', userField: 'User.last_name' },
  { json: 'activeUser.personal_information.dni', userField: 'User.id_card', note: '11 dígitos' },
  {
    json: 'activeUser.personal_information.personal_photo',
    userField: 'User.personal_photo',
    note: 'data URL base64',
  },
  {
    json: '(no devuelto)',
    userField: 'User.email',
    note: 'Sintetizado con {username}@uho.edu.cu',
  },
  {
    json: 'activeUser.account_info.user_type',
    userField: '→ group_to_role_map → User.user_type',
    note: '"Trabajador" → USUARIO',
  },
  { json: 'OK', userField: 'flag de éxito', note: 'true = login válido' },
  {
    json: 'activeUser.personal_information.cn',
    userField: '(no usado)',
    note: 'Nombre completo combinado, redundante con first/last',
  },
];

export function UhoIntegrationGuide({ config, onApplyDefaults, onJumpToTab }: UhoIntegrationGuideProps) {
  const diagnostics = useMemo(() => buildDiagnostics(config), [config]);
  const okCount = diagnostics.filter((d) => d.ok).length;

  const handleApply = () => {
    onApplyDefaults(UHO_DEFAULTS);
    toast.success(
      'Valores recomendados aplicados al formulario. Recuerda pulsar "Guardar cambios" arriba.',
      { duration: 5000 },
    );
  };

  return (
    <div className="space-y-6">
      {/* Intro */}
      <Card className="border-gray-100 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base text-primary-navy flex items-center gap-2">
            <Sparkles size={18} />
            Integración con auth.uho.edu.cu
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-gray-600">
            La Universidad de Holguín expone un endpoint REST que devuelve una
            estructura específica con la información del usuario, su rol y su
            foto. Esta pestaña documenta esa estructura, aplica la configuración
            recomendada con un click y diagnostica los desfases entre la
            configuración actual y la recomendada.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button onClick={handleApply} className="gap-1.5">
              <Sparkles size={14} />
              Aplicar valores recomendados
            </Button>
            {onJumpToTab && (
              <Button variant="outline" onClick={() => onJumpToTab('test')} className="gap-1.5">
                <ExternalLink size={14} />
                Ir al panel de prueba
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Respuesta de ejemplo */}
      <Card className="border-gray-100 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base text-primary-navy flex items-center justify-between gap-2">
            <span>Respuesta esperada del endpoint</span>
            <Badge variant="secondary">Ejemplo real</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-gray-50 border border-gray-100 rounded p-3 text-xs overflow-auto max-h-96 text-gray-800">
            {SAMPLE_RESPONSE}
          </pre>
          <p className="text-xs text-gray-500 mt-2">
            La foto se entrega como <code>data:image/png;base64,…</code> dentro
            del propio JSON (puede pesar &gt;50KB). El flag <code>OK</code> a
            nivel raíz indica éxito del login; <code>activeUser.account_info.user_type</code>
            decide el rol que se asigna en TUho.
          </p>
        </CardContent>
      </Card>

      {/* Mapeo recomendado */}
      <Card className="border-gray-100 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base text-primary-navy">
            Mapeo de la respuesta al modelo User
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-1/3">Path en el JSON</TableHead>
                <TableHead className="w-1/3">Atributo en User</TableHead>
                <TableHead>Nota</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {MAPPING_ROWS.map((row) => (
                <TableRow key={row.json + row.userField}>
                  <TableCell>
                    <code className="text-xs break-all">{row.json}</code>
                  </TableCell>
                  <TableCell>
                    <code className="text-xs break-all">{row.userField}</code>
                  </TableCell>
                  <TableCell className="text-xs text-gray-600">
                    {row.note ?? '—'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Diagnóstico */}
      <Card className="border-gray-100 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base text-primary-navy flex items-center justify-between gap-2">
            <span>Diagnóstico de la configuración actual</span>
            <Badge
              variant={okCount === diagnostics.length ? 'default' : 'secondary'}
              className={
                okCount === diagnostics.length
                  ? 'bg-green-100 text-green-800 hover:bg-green-100'
                  : ''
              }
            >
              {okCount} / {diagnostics.length} OK
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-1/3">Campo</TableHead>
                <TableHead className="w-1/3">Recomendado</TableHead>
                <TableHead className="w-1/3">Actual</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {diagnostics.map((d) => (
                <TableRow key={d.field}>
                  <TableCell className="text-xs font-mono">{d.field}</TableCell>
                  <TableCell className="text-xs">
                    <code className="break-all">{d.recommended || <em>(vacío)</em>}</code>
                  </TableCell>
                  <TableCell className="text-xs">
                    <code className="break-all">{d.current || <em>(vacío)</em>}</code>
                  </TableCell>
                  <TableCell>
                    {d.ok ? (
                      <CheckCircle2 size={16} className="text-green-600" />
                    ) : (
                      <AlertTriangle size={16} className="text-amber-500" />
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Limitaciones */}
      <Card className="border-amber-200 bg-amber-50/30 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base text-amber-900 flex items-center gap-2">
            <AlertTriangle size={18} />
            Limitaciones conocidas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-5 text-sm text-amber-900 space-y-1">
            <li>
              No se valida <code>activeUser.account_state == "TRUE"</code>; el
              provider solo mira <code>OK == true</code>.
            </li>
            <li>
              No se valida <code>password.pass_valid == "Valido"</code>: una
              respuesta con OK=true pero password expirado se acepta. Si la API
              cambia para rechazar passwords vencidos vía OK=false, este punto
              deja de ser problema.
            </li>
            <li>
              No se obliga <code>accept_system_policies == true</code>. Si la
              universidad requiere aceptación previa, deberá manejarse
              fuera de TUho.
            </li>
            <li>
              La foto se almacena tal cual (data URL base64). Para volúmenes
              grandes de usuarios conviene mover a almacenamiento de objetos
              en una iteración futura.
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

// -------------------------------------------------------------------- helpers

interface Diagnostic {
  field: keyof LdapConfig | 'group_to_role_map.Trabajador';
  recommended: string;
  current: string;
  ok: boolean;
}

function buildDiagnostics(cfg: LdapConfig): Diagnostic[] {
  const stringFields: (keyof LdapConfig)[] = [
    'http_api_base_url',
    'http_api_login_path',
    'http_api_method',
    'http_api_username_field',
    'http_api_password_field',
    'http_api_success_field',
    'http_api_user_path',
    'http_api_attr_username',
    'http_api_attr_first_name',
    'http_api_attr_last_name',
    'http_api_attr_id_card',
    'http_api_attr_personal_photo',
    'http_api_groups_path',
    'http_api_email_template',
    'default_role',
  ];

  const rows: Diagnostic[] = stringFields.map((field) => {
    const recommended = String(UHO_DEFAULTS[field] ?? '');
    const current = String(cfg[field] ?? '');
    return {
      field,
      recommended,
      current,
      ok: current === recommended,
    };
  });

  // Check específico del mapeo group_to_role_map para "Trabajador".
  const currentMap = cfg.group_to_role_map || {};
  rows.push({
    field: 'group_to_role_map.Trabajador',
    recommended: 'USUARIO',
    current: currentMap['Trabajador'] || '',
    ok: currentMap['Trabajador'] === 'USUARIO',
  });

  return rows;
}
