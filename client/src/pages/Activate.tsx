/**
 * Página de activación de cuenta vía token recibido por email.
 * Ruta: /activate?token=...
 */
import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import apiClient from '../lib/api-client';

type Status = 'idle' | 'loading' | 'success' | 'error';

export default function Activate() {
  const [params] = useSearchParams();
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = params.get('token');
    if (!token) {
      setStatus('error');
      setMessage('Token no proporcionado en la URL.');
      return;
    }
    setStatus('loading');
    apiClient
      .post('/users/activate/', { activation_token: token })
      .then((res) => {
        setStatus('success');
        setMessage(res.data?.message || 'Cuenta activada exitosamente.');
      })
      .catch((err) => {
        setStatus('error');
        setMessage(err.response?.data?.error || err.response?.data?.detail || 'Token inválido o expirado.');
      });
  }, [params]);

  return (
    <div className="max-w-md mx-auto p-6 text-center">
      <h1 className="text-2xl font-bold mb-4">Activación de cuenta</h1>

      {status === 'loading' && <div className="text-muted-foreground">Validando token...</div>}

      {status === 'success' && (
        <div className="bg-green-50 dark:bg-green-950/20 border border-green-300 dark:border-green-800 p-6 rounded">
          <div className="text-3xl mb-2">✓</div>
          <p className="mb-4">{message}</p>
          <Link to="/login" className="text-primary hover:underline">
            Iniciar sesión →
          </Link>
        </div>
      )}

      {status === 'error' && (
        <div className="bg-destructive/10 border border-destructive p-6 rounded">
          <div className="text-3xl mb-2">✗</div>
          <p className="mb-4">{message}</p>
          <Link to="/login" className="text-primary hover:underline">
            Volver al inicio de sesión →
          </Link>
        </div>
      )}
    </div>
  );
}
