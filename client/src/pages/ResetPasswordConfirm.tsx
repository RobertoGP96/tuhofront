
import { ArrowRight, Lock } from 'lucide-react';
import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import { authService } from '../services/auth.service';

const ResetPasswordConfirm: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden. Por favor, verifique e intente de nuevo.');
      return;
    }

    if (newPassword.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.');
      return;
    }

    if (!token) {
      return;
    }

    setIsLoading(true);
    try {
      await authService.resetPasswordConfirm(token, newPassword);
      setIsSuccess(true);
    } catch (err: unknown) {
      const apiError = err as {
        response?: { data?: { detail?: string; token?: string[]; new_password?: string[] } };
      };
      const detail =
        apiError.response?.data?.detail ??
        apiError.response?.data?.token?.[0] ??
        apiError.response?.data?.new_password?.[0] ??
        'Error al restablecer la contraseña. Por favor, intente de nuevo.';
      setError(detail);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-2xl shadow-primary-navy/5 border-gray-100 rounded-3xl overflow-hidden">
          <CardHeader className="bg-primary-navy p-8 text-white">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/10 rounded-2xl">
                <Lock className="text-secondary-lime w-6 h-6" />
              </div>
              <div>
                <CardTitle className="text-2xl font-black uppercase">
                  Nueva <span className="text-secondary-lime">Contraseña</span>
                </CardTitle>
                <CardDescription className="text-gray-300">
                  Establezca su nueva contraseña de acceso
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-8">
            {!token ? (
              <div className="flex flex-col items-center gap-6 py-4">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </div>
                <p className="text-center text-gray-700 font-medium leading-relaxed">
                  Enlace inválido o expirado. Solicite un nuevo enlace de recuperación.
                </p>
                <Link
                  to="/forgot-password"
                  className="font-bold text-primary-navy hover:text-secondary-lime transition-colors text-sm"
                >
                  Solicitar nuevo enlace
                </Link>
              </div>
            ) : isSuccess ? (
              <div className="flex flex-col items-center gap-6 py-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <p className="text-center text-gray-700 font-medium leading-relaxed">
                  Su contraseña ha sido restablecida exitosamente.
                </p>
                <Link
                  to="/login"
                  className="font-bold text-primary-navy hover:text-secondary-lime transition-colors text-sm"
                >
                  Iniciar sesión
                </Link>
              </div>
            ) : (
              <form className="space-y-5" onSubmit={handleSubmit}>
                {error !== null && (
                  <div className="p-4 bg-red-50 border border-red-100 rounded-2xl animate-in fade-in slide-in-from-top-2 duration-300">
                    <p className="text-sm text-red-600 text-center font-semibold">{error}</p>
                  </div>
                )}

                <div className="space-y-4">
                  <div className="relative group/input">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400 group-focus-within/input:text-primary-navy transition-colors" />
                    </div>
                    <input
                      id="new-password"
                      name="new-password"
                      type="password"
                      required
                      className="block w-full pl-11 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-primary-navy placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-navy/20 focus:border-primary-navy transition-all"
                      placeholder="Nueva contraseña"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                  </div>

                  <div className="relative group/input">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400 group-focus-within/input:text-primary-navy transition-colors" />
                    </div>
                    <input
                      id="confirm-password"
                      name="confirm-password"
                      type="password"
                      required
                      className="block w-full pl-11 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-primary-navy placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-navy/20 focus:border-primary-navy transition-all"
                      placeholder="Confirmar contraseña"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-primary-navy hover:bg-primary-navy/90 text-white py-4 px-6 rounded-2xl font-bold uppercase tracking-wider shadow-lg shadow-primary-navy/20 hover:shadow-xl hover:shadow-primary-navy/30 active:scale-[0.98] disabled:opacity-70 disabled:pointer-events-none transition-all flex items-center justify-center gap-3 group/btn"
                >
                  {isLoading ? (
                    <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Restablecer contraseña</span>
                      <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>
            )}
          </CardContent>
        </Card>

        <p className="text-center mt-6 text-sm text-gray-500">
          ¿Recuerda su contraseña?{' '}
          <Link
            to="/login"
            className="font-bold text-primary-navy hover:text-secondary-lime transition-colors"
          >
            Iniciar sesión
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ResetPasswordConfirm;
