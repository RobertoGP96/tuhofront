/**
 * Muestra el historial (audit log) de un recurso específico.
 * Usado dentro de diálogos de detalle de trámites y reservas.
 */
import { useEffect, useState } from 'react';
import { auditService, type AuditLogEntry } from '../services/audit.service';

interface Props {
  appLabel: string;
  model: string;
  resourceId: string;
}

export default function ResourceHistory({ appLabel, model, resourceId }: Props) {
  const [entries, setEntries] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    setError(null);
    auditService
      .resourceHistory(appLabel, model, resourceId)
      .then((data) => {
        if (!ignore) setEntries(data);
      })
      .catch(() => {
        if (!ignore) setError('No se pudo cargar el historial.');
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, [appLabel, model, resourceId]);

  if (loading) return <div className="text-sm text-muted-foreground">Cargando historial...</div>;
  if (error) return <div className="text-sm text-destructive">{error}</div>;
  if (entries.length === 0) return <div className="text-sm text-muted-foreground">Sin eventos registrados.</div>;

  return (
    <ol className="space-y-3 relative border-l pl-4 ml-2">
      {entries.map((entry) => (
        <li key={entry.id} className="relative">
          <span className="absolute -left-[7px] top-1.5 w-3 h-3 bg-primary rounded-full border-2 border-background" />
          <div className="text-xs text-muted-foreground">
            {new Date(entry.created_at).toLocaleString('es-ES')}
          </div>
          <div className="font-medium text-sm">{entry.action_display}</div>
          <div className="text-sm text-muted-foreground">
            {entry.description || '—'}
          </div>
          {entry.user_full_name && (
            <div className="text-xs mt-1">Por: {entry.user_full_name} ({entry.user_username})</div>
          )}
          {entry.metadata && Object.keys(entry.metadata).length > 0 && (
            <details className="mt-1">
              <summary className="text-xs text-muted-foreground cursor-pointer">Detalles</summary>
              <pre className="text-xs bg-muted rounded p-2 mt-1 overflow-auto">
                {JSON.stringify(entry.metadata, null, 2)}
              </pre>
            </details>
          )}
        </li>
      ))}
    </ol>
  );
}
