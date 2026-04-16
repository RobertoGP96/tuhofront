/**
 * Página pública para verificar autenticidad de un documento oficial.
 *
 * Se accede vía QR (URL /verify/:code) o ingresando el código manualmente.
 */
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { documentsService, type VerifyResult } from '../services/documents.service';

export default function VerifyDocument() {
  const { code: codeParam } = useParams<{ code?: string }>();
  const [code, setCode] = useState(codeParam ?? '');
  const [result, setResult] = useState<VerifyResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const doVerify = async (c: string) => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await documentsService.verify(c.trim().toUpperCase());
      setResult(data);
    } catch {
      setError('El código proporcionado no corresponde a ningún documento emitido.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (codeParam) void doVerify(codeParam);
  }, [codeParam]);

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-2">Verificación de documento</h1>
      <p className="text-muted-foreground mb-6">
        Ingresa el código que aparece en el documento (o escanea el QR) para confirmar su autenticidad.
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          void doVerify(code);
        }}
        className="flex gap-2 mb-6"
      >
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Código de verificación"
          className="flex-1 border rounded px-3 py-2 bg-background font-mono"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-primary text-primary-foreground px-4 rounded hover:opacity-90 disabled:opacity-50"
        >
          Verificar
        </button>
      </form>

      {error && (
        <div className="p-4 bg-destructive/10 text-destructive rounded">{error}</div>
      )}

      {result && (
        <div
          className={`p-6 rounded-lg border-2 ${
            result.valid
              ? 'bg-green-50 border-green-300 dark:bg-green-950/20 dark:border-green-800'
              : 'bg-destructive/10 border-destructive'
          }`}
        >
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">{result.valid ? '✓' : '✗'}</span>
            <h2 className="text-xl font-semibold">
              {result.valid ? 'Documento válido' : 'Documento inválido / revocado'}
            </h2>
          </div>
          <dl className="space-y-2">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Título:</dt>
              <dd className="font-medium">{result.title}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Tipo:</dt>
              <dd>{result.doc_type}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Emitido:</dt>
              <dd>{new Date(result.issued_at).toLocaleString('es-ES')}</dd>
            </div>
            {result.expires_at && (
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Expira:</dt>
                <dd>{new Date(result.expires_at).toLocaleString('es-ES')}</dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Código:</dt>
              <dd className="font-mono">{result.verification_code}</dd>
            </div>
            {result.revoked && (
              <div className="mt-4 p-3 bg-destructive/10 rounded">
                <div className="font-medium text-destructive">Motivo de revocación:</div>
                <div>{result.revoked_reason}</div>
                {result.revoked_at && (
                  <div className="text-sm text-muted-foreground mt-1">
                    {new Date(result.revoked_at).toLocaleString('es-ES')}
                  </div>
                )}
              </div>
            )}
          </dl>
        </div>
      )}
    </div>
  );
}
