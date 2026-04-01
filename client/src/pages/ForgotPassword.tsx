
import { ArrowRight, KeyRound } from 'lucide-react';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import { authService } from '../services/auth.service';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      await authService.forgotPassword(email);
      setIsSuccess(true);
    } catch (err: unknown) {
      const apiError = err as { response?: { data?: { detail?: string; email?: string[] } } };
      const detail =
        apiError.response?.data?.detail ??
        apiError.response?.data?.email?.[0] ??
        'Error al procesar la solicitud. Por favor, intente de nuevo.';
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
                <KeyRound className="text-secondary-lime w-6 h-6" />
              </div>
              <div>
                <CardTitle className="text-2xl font-black uppercase">
                  Recuperar <span className="text-secondary-lime">Contraseña</span>
                </CardTitle>
                <CardDescription className="text-gray-300">
                  Ingrese su correo para recibir instrucciones
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-8">
            {isSuccess ? (
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
                  Revise su correo electrónico — Le enviamos instrucciones para restablecer su
                  contraseña.
                </p>
                <Link
                  to="/login"
                  className="font-bold text-primary-navy hover:text-secondary-lime transition-colors text-sm"
                >
                  Volver al inicio de sesión
                </Link>
              </div>
            ) : (
              <form className="space-y-5" onSubmit={handleSubmit}>
                {error !== null && (
                  <div className="p-4 bg-red-50 border border-red-100 rounded-2xl animate-in fade-in slide-in-from-top-2 duration-300">
                    <p className="text-sm text-red-600 text-center font-semibold">{error}</p>
                  </div>
                )}

                <div className="relative group/input">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className="block w-full px-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-primary-navy placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-navy/20 focus:border-primary-navy transition-all"
                    placeholder="Correo electrónico"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
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
                      <span>Enviar instrucciones</span>
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

export default ForgotPassword;
