import { useState } from 'react';
import { toast } from 'sonner';
import { AlertCircle, CheckCircle2, PlayCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ldapService, type LdapConfig, type LdapTestResponse } from '@/services/ldap.service';

interface LdapTestPanelProps {
  config: LdapConfig;
  onTestComplete?: (result: LdapTestResponse) => void;
}

export function LdapTestPanel({ config, onTestComplete }: LdapTestPanelProps) {
  const [testUsername, setTestUsername] = useState('');
  const [testPassword, setTestPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<LdapTestResponse | null>(null);

  const handleTest = async () => {
    setLoading(true);
    setResult(null);
    try {
      const response = await ldapService.testConnection({
        test_username: testUsername.trim() || undefined,
        bind_password: testPassword.trim() || undefined,
      });
      setResult(response);
      onTestComplete?.(response);
      if (response.ok) {
        toast.success('Conexión LDAP exitosa');
      } else {
        toast.error('La prueba LDAP falló');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al probar conexión';
      toast.error(message);
      setResult({
        ok: false,
        message,
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

  return (
    <Card className="border-gray-100 shadow-sm">
      <CardHeader>
        <CardTitle className="text-base text-primary-navy flex items-center gap-2">
          <PlayCircle size={18} />
          Probar conexión
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-600">
          Verifica que el servidor responde y que el bind funciona usando la
          configuración guardada. Opcionalmente busca un usuario para validar
          el filtro y los grupos.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <Label htmlFor="test-username">Usuario de prueba (opcional)</Label>
            <Input
              id="test-username"
              placeholder="ej: jdoe"
              value={testUsername}
              onChange={(e) => setTestUsername(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="test-password">
              Override de bind password (opcional)
            </Label>
            <Input
              id="test-password"
              type="password"
              placeholder="usa LDAP_BIND_PASSWORD si vacío"
              value={testPassword}
              onChange={(e) => setTestPassword(e.target.value)}
              autoComplete="new-password"
            />
          </div>
        </div>

        <Button onClick={handleTest} disabled={loading || !config.server_uri}>
          {loading ? 'Probando...' : 'Probar conexión'}
        </Button>

        {result && (
          <div
            className={`rounded-md border p-3 text-sm ${
              result.ok
                ? 'border-green-200 bg-green-50 text-green-900'
                : 'border-red-200 bg-red-50 text-red-900'
            }`}
          >
            <div className="flex items-start gap-2">
              {result.ok ? (
                <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
              ) : (
                <AlertCircle size={18} className="mt-0.5 shrink-0" />
              )}
              <div className="flex-1 space-y-1">
                <div className="font-medium">
                  {result.ok ? 'Éxito' : 'Error'}: {result.message}
                </div>
                {result.user_dn && (
                  <div className="text-xs">
                    <strong>Usuario:</strong> <code>{result.user_dn}</code>
                  </div>
                )}
                {result.groups.length > 0 && (
                  <div className="text-xs">
                    <strong>Grupos ({result.groups.length}):</strong>
                    <ul className="list-disc pl-5 mt-1">
                      {result.groups.map((dn) => (
                        <li key={dn}>
                          <code>{dn}</code>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
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
