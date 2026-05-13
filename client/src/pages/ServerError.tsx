import { useNavigate } from 'react-router-dom';
import { ServerCrash } from 'lucide-react';

export default function ServerError() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-50 text-red-500">
          <ServerCrash size={32} />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-primary-navy">Error del servidor</h1>
          <p className="text-sm text-gray-500">
            El servidor encontró un problema procesando tu solicitud. Por favor intenta nuevamente
            en unos momentos.
          </p>
        </div>
        <div className="flex gap-2 justify-center">
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary-navy text-white font-medium rounded-md hover:opacity-90 transition-opacity"
          >
            Reintentar
          </button>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 border border-gray-200 text-gray-700 font-medium rounded-md hover:bg-gray-100 transition-colors"
          >
            Ir al inicio
          </button>
        </div>
      </div>
    </div>
  );
}
