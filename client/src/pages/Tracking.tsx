/**
 * Página pública de seguimiento de trámites.
 *
 * Permite a solicitantes (incluso externos sin cuenta) consultar el estado de
 * un trámite proporcionando su código de seguimiento + carnet de identidad.
 */
import { useState } from 'react';
import { publicService, type PublicTrackingResult } from '../services/public.service';

export default function Tracking() {
  const [code, setCode] = useState('');
  const [idCard, setIdCard] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PublicTrackingResult | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await publicService.trackProcedure(code.trim(), idCard.trim());
      setResult(data);
      if (!data.found) {
        setError('No se encontró ningún trámite con los datos proporcionados.');
      }
    } catch {
      setError('No se encontró ningún trámite con los datos proporcionados.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-2">Consulta tu trámite</h1>
      <p className="text-muted-foreground mb-6">
        Ingresa tu código de seguimiento y carnet de identidad para ver el estado actual. No requiere inicio de sesión.
      </p>

      <form onSubmit={onSubmit} className="space-y-4 bg-card p-6 rounded-lg border">
        <div>
          <label className="block text-sm font-medium mb-1">Código de seguimiento</label>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
            className="w-full border rounded px-3 py-2 bg-background"
            placeholder="Ej: a1b2c3d4-..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Carnet de identidad</label>
          <input
            type="text"
            value={idCard}
            onChange={(e) => setIdCard(e.target.value)}
            required
            pattern="[0-9]{11}"
            maxLength={11}
            className="w-full border rounded px-3 py-2 bg-background"
            placeholder="11 dígitos"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary text-primary-foreground py-2 rounded hover:opacity-90 disabled:opacity-50"
        >
          {loading ? 'Consultando...' : 'Consultar'}
        </button>
      </form>

      {error && (
        <div className="mt-4 p-4 bg-destructive/10 text-destructive rounded">{error}</div>
      )}

      {result?.found && (
        <div className="mt-6 bg-card p-6 rounded-lg border">
          <h2 className="text-lg font-semibold mb-4">Resultado</h2>
          <dl className="space-y-2">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Tipo:</dt>
              <dd className="font-medium">{result.resource_name}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Estado:</dt>
              <dd className="font-medium text-primary">{result.state_display ?? result.state}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Código:</dt>
              <dd className="font-mono text-sm">{result.tracking_code}</dd>
            </div>
            {result.created_at && (
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Creado:</dt>
                <dd>{new Date(result.created_at).toLocaleString('es-ES')}</dd>
              </div>
            )}
            {result.updated_at && (
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Última actualización:</dt>
                <dd>{new Date(result.updated_at).toLocaleString('es-ES')}</dd>
              </div>
            )}
          </dl>
        </div>
      )}
    </div>
  );
}
