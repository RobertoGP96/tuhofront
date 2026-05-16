
import { ArrowRight, Lock, LogIn, User } from 'lucide-react';
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const user = await login(username, password);
      const redirectMap: Record<string, string> = {
        ADMIN: '/admin',
        GESTOR_INTERNO: '/gestor-interno',
        GESTOR_SECRETARIA: '/gestor-secretaria',
        GESTOR_RESERVAS: '/gestor-reservas',
        USUARIO: '/dashboard',
      };
      const isSystemAdmin = user?.role === 'ADMIN' || user?.is_staff;
      const destination = from !== '/'
        ? from
        : isSystemAdmin
          ? '/admin'
          : (user?.user_type ? redirectMap[user.user_type] ?? '/dashboard' : '/dashboard');
      navigate(destination, { replace: true });
    } catch (err: unknown) {
      const error = err as { response?: { data?: { detail?: string } } };
      setError(error.response?.data?.detail || 'Error al iniciar sesión. Por favor, intente de nuevo.');
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-accent/30">
      <div className="w-full max-w-md space-y-8">
        {/* Card */}
        <div className="bg-white rounded-4xl shadow-2xl shadow-primary-navy/5 border border-gray-100 p-8 md:p-10 relative overflow-hidden group">
          {/* Subtle Decorative Element */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-secondary-lime/10 rounded-bl-full -mr-16 -mt-16 transition-all duration-700 group-hover:scale-110" />
          
          <div className="relative">
            <div className="flex flex-col items-center mb-10">
              <div className="w-20 h-20 bg-primary-navy rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-primary-navy/20">
                <LogIn className="text-secondary-lime w-10 h-10" />
              </div>
              <h2 className="text-3xl font-black text-primary-navy text-center uppercase tracking-tight">
                Iniciar <span className="text-secondary-lime">Sesión</span>
              </h2>
              <p className="text-gray-500 mt-2 font-medium">Plataforma de Trámites UHo</p>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
              {error && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-2xl animate-in fade-in slide-in-from-top-2 duration-300">
                  <p className="text-sm text-red-600 text-center font-semibold">{error}</p>
                </div>
              )}

              <div className="space-y-4">
                <div className="relative group/input">
                  <label htmlFor="username" className="sr-only">Usuario o correo</label>
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none" aria-hidden="true">
                    <User className="h-5 w-5 text-gray-400 group-focus-within/input:text-primary-navy transition-colors" />
                  </div>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    required
                    autoComplete="username"
                    autoCapitalize="none"
                    spellCheck={false}
                    className="block w-full pl-11 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-primary-navy placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-navy/20 focus:border-primary-navy transition-all"
                    placeholder="Usuario o Correo"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>

                <div className="relative group/input">
                  <label htmlFor="password" className="sr-only">Contraseña</label>
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none" aria-hidden="true">
                    <Lock className="h-5 w-5 text-gray-400 group-focus-within/input:text-primary-navy transition-colors" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    autoComplete="current-password"
                    className="block w-full pl-11 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-primary-navy placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-navy/20 focus:border-primary-navy transition-all"
                    placeholder="Contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between px-1">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-primary-navy focus:ring-primary-navy border-gray-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-500 font-medium cursor-pointer">
                    Recordarme
                  </label>
                </div>

                <div className="text-sm">
                  <Link to="/forgot-password" className="font-bold text-primary-navy hover:text-secondary-lime transition-colors">
                    ¿Olvidó su contraseña?
                  </Link>
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
                    <span>Entrar al Sistema</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 pt-8 border-t border-gray-50 text-center">
              <p className="text-gray-500 font-medium">
                ¿No tiene una cuenta?{' '}
                <Link
                  to="/register"
                  className="text-primary-navy font-black hover:text-secondary-lime transition-colors underline decoration-secondary-lime decoration-2 underline-offset-4"
                >
                  Regístrese aquí
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Footer for Login */}
        <p className="text-center text-gray-400 text-sm font-medium">
          &copy; {new Date().getFullYear()} Universidad de Holguín. Todos los derechos reservados.
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
