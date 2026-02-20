
import { ArrowRight, Lock, Mail, User, UserCheck, UserPlus, Phone, IdCard, Building, Calendar } from 'lucide-react';
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/auth.service';
import type { RegisterData } from '../types/auth.types';

const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState<RegisterData>({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    id_card: '',
    phone: '',
    password: '',
    password_confirm: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.username || formData.username.length < 3) {
      newErrors.username = 'El nombre de usuario debe tener al menos 3 caracteres';
    }

    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Ingrese un correo electrónico válido';
    }

    if (!formData.first_name || formData.first_name.trim().length < 2) {
      newErrors.first_name = 'Ingrese su nombre(s)';
    }

    if (!formData.last_name || formData.last_name.trim().length < 2) {
      newErrors.last_name = 'Ingrese sus apellidos';
    }

    if (!formData.id_card || formData.id_card.length < 9) {
      newErrors.id_card = 'Ingrese un número de carnet válido (9 dígitos)';
    }

    if (!formData.password || formData.password.length < 8) {
      newErrors.password = 'La contraseña debe tener al menos 8 caracteres';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'La contraseña debe contener mayúsculas, minúsculas y números';
    }

    if (formData.password !== formData.password_confirm) {
      newErrors.password_confirm = 'Las contraseñas no coinciden';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      console.log('Form data before submit:', formData);
      await authService.register(formData);
      navigate('/login', { state: { message: 'Registro exitoso. Por favor, inicie sesión.' } });
    } catch (err: unknown) {
      const error = err as { response?: { data?: Record<string, string[]> } };
      const responseData = error.response?.data;
      
      if (responseData) {
        const fieldErrors: Record<string, string> = {};
        Object.keys(responseData).forEach(key => {
          const messages = responseData[key];
          if (Array.isArray(messages)) {
            fieldErrors[key] = messages[0];
          }
        });
        setErrors(fieldErrors);
      } else {
        setErrors({ general: 'Error al registrar usuario. Intente de nuevo.' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-accent/30 py-12">
      <div className="w-full max-w-3xl space-y-8">
        <div className="bg-white rounded-4xl shadow-2xl shadow-primary-navy/5 border border-gray-100 p-8 md:p-12 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-secondary-lime/10 rounded-bl-full -mr-16 -mt-16 transition-all duration-700 group-hover:scale-110" />
          
          <div className="relative">
            <div className="flex flex-col items-center mb-10 text-center">
              <div className="w-20 h-20 bg-primary-navy rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-primary-navy/20">
                <UserPlus className="text-secondary-lime w-10 h-10" />
              </div>
              <h2 className="text-3xl font-black text-primary-navy uppercase tracking-tight">
                Crear <span className="text-secondary-lime">Cuenta</span>
              </h2>
              <p className="text-gray-500 mt-2 font-medium max-w-sm">
                Únete a la comunidad universitaria y gestiona tus trámites de forma digital.
              </p>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              {(errors.general || Object.keys(errors).length > 0) && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-2xl animate-in fade-in slide-in-from-top-2 duration-300">
                  <p className="text-sm text-red-600 text-center font-semibold">
                    {errors.general || 'Por favor, corrija los errores indicados'}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="relative group/input">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400 group-focus-within/input:text-primary-navy transition-colors" />
                  </div>
                  <input
                    name="username"
                    type="text"
                    required
                    className={`block w-full pl-11 pr-4 py-4 bg-gray-50 border rounded-2xl text-primary-navy placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-navy/20 focus:border-primary-navy transition-all ${errors.username ? 'border-red-300' : 'border-gray-100'}`}
                    placeholder="Nombre de Usuario *"
                    value={formData.username}
                    onChange={handleChange}
                  />
                  {errors.username && <p className="text-xs text-red-500 mt-1">{errors.username}</p>}
                </div>

                <div className="relative group/input">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <IdCard className="h-5 w-5 text-gray-400 group-focus-within/input:text-primary-navy transition-colors" />
                  </div>
                  <input
                    name="id_card"
                    type="text"
                    required
                    maxLength={11}
                    className={`block w-full pl-11 pr-4 py-4 bg-gray-50 border rounded-2xl text-primary-navy placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-navy/20 focus:border-primary-navy transition-all ${errors.id_card ? 'border-red-300' : 'border-gray-100'}`}
                    placeholder="Carnet de Identidad *"
                    value={formData.id_card}
                    onChange={handleChange}
                  />
                  {errors.id_card && <p className="text-xs text-red-500 mt-1">{errors.id_card}</p>}
                </div>

                <div className="relative group/input">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400 group-focus-within/input:text-primary-navy transition-colors" />
                  </div>
                  <input
                    name="email"
                    type="email"
                    required
                    className={`block w-full pl-11 pr-4 py-4 bg-gray-50 border rounded-2xl text-primary-navy placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-navy/20 focus:border-primary-navy transition-all ${errors.email ? 'border-red-300' : 'border-gray-100'}`}
                    placeholder="Correo Institucional *"
                    value={formData.email}
                    onChange={handleChange}
                  />
                  {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                </div>

                <div className="relative group/input">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-gray-400 group-focus-within/input:text-primary-navy transition-colors" />
                  </div>
                  <input
                    name="phone"
                    type="tel"
                    className="block w-full pl-11 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-primary-navy placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-navy/20 focus:border-primary-navy transition-all"
                    placeholder="Teléfono (opcional)"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>

                <div className="relative group/input">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <UserCheck className="h-5 w-5 text-gray-400 group-focus-within/input:text-primary-navy transition-colors" />
                  </div>
                  <input
                    name="first_name"
                    type="text"
                    required
                    className={`block w-full pl-11 pr-4 py-4 bg-gray-50 border rounded-2xl text-primary-navy placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-navy/20 focus:border-primary-navy transition-all ${errors.first_name ? 'border-red-300' : 'border-gray-100'}`}
                    placeholder="Nombre(s) *"
                    value={formData.first_name}
                    onChange={handleChange}
                  />
                  {errors.first_name && <p className="text-xs text-red-500 mt-1">{errors.first_name}</p>}
                </div>

                <div className="relative group/input">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <UserCheck className="h-5 w-5 text-gray-400 group-focus-within/input:text-primary-navy transition-colors" />
                  </div>
                  <input
                    name="last_name"
                    type="text"
                    required
                    className={`block w-full pl-11 pr-4 py-4 bg-gray-50 border rounded-2xl text-primary-navy placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-navy/20 focus:border-primary-navy transition-all ${errors.last_name ? 'border-red-300' : 'border-gray-100'}`}
                    placeholder="Apellidos *"
                    value={formData.last_name}
                    onChange={handleChange}
                  />
                  {errors.last_name && <p className="text-xs text-red-500 mt-1">{errors.last_name}</p>}
                </div>

                <div className="relative group/input">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Building className="h-5 w-5 text-gray-400 group-focus-within/input:text-primary-navy transition-colors" />
                  </div>
                  <input
                    name="workplace"
                    type="text"
                    className="block w-full pl-11 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-primary-navy placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-navy/20 focus:border-primary-navy transition-all"
                    placeholder="Centro de Trabajo (opcional)"
                    value={formData.workplace}
                    onChange={handleChange}
                  />
                </div>

                <div className="relative group/input">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Calendar className="h-5 w-5 text-gray-400 group-focus-within/input:text-primary-navy transition-colors" />
                  </div>
                  <input
                    name="date_of_birth"
                    type="date"
                    className="block w-full pl-11 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-primary-navy placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-navy/20 focus:border-primary-navy transition-all"
                    placeholder="Fecha de Nacimiento (opcional)"
                    value={formData.date_of_birth}
                    onChange={handleChange}
                  />
                </div>

                <div className="relative group/input">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400 group-focus-within/input:text-primary-navy transition-colors" />
                  </div>
                  <input
                    name="password"
                    type="password"
                    required
                    className={`block w-full pl-11 pr-4 py-4 bg-gray-50 border rounded-2xl text-primary-navy placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-navy/20 focus:border-primary-navy transition-all ${errors.password ? 'border-red-300' : 'border-gray-100'}`}
                    placeholder="Contraseña *"
                    value={formData.password}
                    onChange={handleChange}
                  />
                  {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
                </div>

                <div className="relative group/input">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400 group-focus-within/input:text-primary-navy transition-colors" />
                  </div>
                  <input
                    name="password_confirm"
                    type="password"
                    required
                    className={`block w-full pl-11 pr-4 py-4 bg-gray-50 border rounded-2xl text-primary-navy placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-navy/20 focus:border-primary-navy transition-all ${errors.password_confirm ? 'border-red-300' : 'border-gray-100'}`}
                    placeholder="Confirmar Contraseña *"
                    value={formData.password_confirm}
                    onChange={handleChange}
                  />
                  {errors.password_confirm && <p className="text-xs text-red-500 mt-1">{errors.password_confirm}</p>}
                </div>
              </div>

              <div className="pt-2 px-1">
                <label className="flex items-start gap-3 text-sm text-gray-500 font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    required
                    className="mt-1 h-4 w-4 text-primary-navy focus:ring-primary-navy border-gray-300 rounded"
                  />
                  <span>
                    Acepto los <a href="#" className="text-primary-navy font-bold hover:text-secondary-lime underline decoration-secondary-lime/30">Términos de Servicio</a> y la <a href="#" className="text-primary-navy font-bold hover:text-secondary-lime underline decoration-secondary-lime/30">Política de Privacidad</a> de la Universidad.
                  </span>
                </label>
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
                    <span>Crear mi Cuenta</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 pt-8 border-t border-gray-50 text-center">
              <p className="text-gray-500 font-medium">
                ¿Ya tiene una cuenta?{' '}
                <Link
                  to="/login"
                  className="text-primary-navy font-black hover:text-secondary-lime transition-colors underline decoration-secondary-lime decoration-2 underline-offset-4"
                >
                  Inicie sesión aquí
                </Link>
              </p>
            </div>
          </div>
        </div>

        <p className="text-center text-gray-400 text-sm font-medium">
          &copy; {new Date().getFullYear()} Universidad de Holguín. Todos los derechos reservados.
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
