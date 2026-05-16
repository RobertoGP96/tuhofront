import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { CheckCircle2, X } from 'lucide-react';

interface JustCreatedBannerProps {
  trackingNumber?: string | number;
  title?: string;
  description?: string;
}

/**
 * Banner verde que se muestra cuando el usuario llega a la página de detalle
 * tras crear un trámite. Lee `location.state.justCreated` (puesto por el
 * formulario al hacer `navigate(...)`) y se auto-limpia para que no
 * reaparezca al refrescar la página.
 */
export function JustCreatedBanner({
  trackingNumber,
  title = '¡Trámite enviado con éxito!',
  description,
}: JustCreatedBannerProps) {
  const location = useLocation();
  const [visible, setVisible] = useState(Boolean(location.state?.justCreated));

  useEffect(() => {
    if (location.state?.justCreated) {
      window.history.replaceState({}, '');
    }
  }, [location.state]);

  if (!visible) return null;

  const fallbackDescription = trackingNumber
    ? `Su solicitud #${trackingNumber} fue registrada correctamente.`
    : 'Su solicitud fue registrada correctamente.';

  return (
    <div className="flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 px-4 py-3">
      <CheckCircle2 className="h-5 w-5 shrink-0 text-green-600 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-green-800">{title}</p>
        <p className="text-xs text-green-700 mt-0.5">{description ?? fallbackDescription}</p>
      </div>
      <button
        type="button"
        onClick={() => setVisible(false)}
        className="shrink-0 rounded-md p-1 text-green-700 hover:bg-green-100"
        aria-label="Cerrar"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
