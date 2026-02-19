import { useUserMutations } from '@/hooks/platform/use-users';
import type { CreateUserData, UserGender, UserProfile, UserRole } from '@/types/user';
import { Camera, Fingerprint, Info, Mail, Save, Shield, User, X } from 'lucide-react';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';

interface UserFormProps {
  initialData?: UserProfile;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const ROLES: { value: UserRole; label: string }[] = [
  { value: 'STUDENT', label: 'Estudiante' },
  { value: 'PROFESSOR', label: 'Profesor' },
  { value: 'STAFF', label: 'Personal' },
  { value: 'EXTERNAL', label: 'Externo' },
  { value: 'ADMIN', label: 'Administrador' },
];

const GENDERS: { value: UserGender; label: string }[] = [
  { value: 'MALE', label: 'Masculino' },
  { value: 'FEMALE', label: 'Femenino' },
  { value: 'OTHER', label: 'Otro' },
  { value: 'PREFER_NOT_TO_SAY', label: 'No especificar' },
];

export const UserForm: React.FC<UserFormProps> = ({
  initialData,
  onSuccess,
  onCancel,
}) => {
  const { createUser, updateUser } = useUserMutations();
  const [imagePreview, setImagePreview] = useState<string | null>(initialData?.profile_picture || null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateUserData>({
    defaultValues: initialData
      ? {
          username: initialData.username,
          email: initialData.email,
          first_name: initialData.first_name,
          last_name: initialData.last_name,
          id_card: initialData.id_card,
          user_type: initialData.user_type,
          phone: initialData.phone,
          address: initialData.address,
          gender: initialData.gender,
        }
      : {
          user_type: 'STUDENT',
          gender: 'MALE',
        },
  });

  const onSubmit = async (data: CreateUserData) => {
    try {
      if (initialData) {
        await updateUser.mutateAsync({ id: initialData.id, data: data as any });
      } else {
        await createUser.mutateAsync(data);
      }
      onSuccess?.();
    } catch (err: any) {
      // Handled by mutation
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const loading = createUser.isPending || updateUser.isPending;

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-8 bg-white p-8 lg:p-12 rounded-3xl shadow-2xl border border-gray-100 animate-in fade-in slide-in-from-bottom-6 duration-500 max-w-5xl mx-auto"
    >
      <div className="flex items-center justify-between border-b border-gray-100 pb-8 mb-8">
        <div className="flex items-center gap-5">
          <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl">
            <User className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">
              {initialData ? 'Editar Usuario' : 'Nuevo Usuario'}
            </h2>
            <p className="text-gray-500 font-medium mt-1">
              Configura el perfil y permisos de acceso del usuario.
            </p>
          </div>
        </div>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="p-3 hover:bg-gray-100 rounded-full transition-all text-gray-400 active:scale-90"
          >
            <X className="w-8 h-8" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        {/* Left Column: Avatar & ID */}
        <div className="flex flex-col items-center gap-6">
          <div className="relative group cursor-pointer">
             <div className="w-40 h-40 rounded-3xl bg-gray-50 border-4 border-white shadow-xl overflow-hidden flex items-center justify-center transition-all group-hover:border-blue-500/20">
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <Camera className="w-12 h-12 text-gray-300 group-hover:text-blue-500 transition-colors" />
                )}
             </div>
             <div className="absolute -bottom-2 -right-2 bg-blue-600 text-white p-2.5 rounded-xl shadow-lg group-hover:scale-110 transition-all">
                <Camera className="w-5 h-5" />
             </div>
             <input 
               type="file" 
               className="absolute inset-0 opacity-0 cursor-pointer" 
               accept="image/*" 
               onChange={handleImageChange}
             />
          </div>
          
          <div className="w-full space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <Fingerprint className="w-3.5 h-3.5" />
                Carnet de Identidad
              </label>
              <input
                {...register('id_card', { 
                  required: 'El CI es obligatorio',
                  pattern: { value: /^[0-9]{11}$/, message: 'Debe tener 11 dígitos' }
                })}
                placeholder="00000000000"
                className={`w-full px-4 py-3.5 rounded-2xl border bg-gray-50/30 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all outline-none font-bold tracking-widest text-center ${
                  errors.id_card ? 'border-red-400 text-red-600' : 'border-gray-200 focus:border-blue-500'
                }`}
              />
              {errors.id_card && <p className="text-[10px] text-red-500 font-black uppercase text-center">{errors.id_card.message}</p>}
            </div>
            
            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100/50">
              <div className="flex gap-3">
                <Info className="w-5 h-5 text-amber-500 shrink-0" />
                <p className="text-[11px] text-amber-700 font-medium leading-relaxed">
                  Asegúrate de que el CI coincida exactamente con el documento oficial para evitar duplicados.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Columns: Forms */}
        <div className="md:col-span-2 space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* First Name */}
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Nombres</label>
              <input
                {...register('first_name', { required: 'Campo obligatorio' })}
                placeholder="Ej: Juan"
                className={`w-full px-4 py-3.5 rounded-2xl border bg-gray-50/30 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all outline-none font-medium ${
                  errors.first_name ? 'border-red-400' : 'border-gray-200 focus:border-blue-500'
                }`}
              />
            </div>

            {/* Last Name */}
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Apellidos</label>
              <input
                {...register('last_name', { required: 'Campo obligatorio' })}
                placeholder="Ej: Pérez García"
                className={`w-full px-4 py-3.5 rounded-2xl border bg-gray-50/30 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all outline-none font-medium ${
                  errors.last_name ? 'border-red-400' : 'border-gray-200 focus:border-blue-500'
                }`}
              />
            </div>

            {/* Username */}
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Usuario</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">@</span>
                <input
                  {...register('username', { required: 'Obligatorio' })}
                  placeholder="juanp"
                  disabled={!!initialData}
                  className={`w-full pl-8 pr-4 py-3.5 rounded-2xl border bg-gray-50/30 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all outline-none font-bold disabled:opacity-50 ${
                    errors.username ? 'border-red-400' : 'border-gray-200 focus:border-blue-500'
                  }`}
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Correo Electrónico</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  {...register('email', { 
                    required: 'Obligatorio',
                    pattern: { value: /^\S+@\S+$/i, message: 'Correo inválido' }
                  })}
                  type="email"
                  placeholder="juan@uho.edu.cu"
                  className={`w-full pl-11 pr-4 py-3.5 rounded-2xl border bg-gray-50/30 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all outline-none font-medium ${
                    errors.email ? 'border-red-400' : 'border-gray-200 focus:border-blue-500'
                  }`}
                />
              </div>
            </div>

            {/* Role */}
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Rol del Sistema</label>
              <div className="relative">
                <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <select
                  {...register('user_type')}
                  className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-gray-200 bg-gray-50/30 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-bold appearance-none"
                >
                  {ROLES.map((role) => (
                    <option key={role.value} value={role.value}>{role.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Gender */}
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Género</label>
              <select
                {...register('gender')}
                className="w-full px-4 py-3.5 rounded-2xl border border-gray-200 bg-gray-50/30 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-bold appearance-none"
              >
                {GENDERS.map((gender) => (
                  <option key={gender.value} value={gender.value}>{gender.label}</option>
                ))}
              </select>
            </div>

            {!initialData && (
              <>
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Contraseña</label>
                  <input
                    {...register('password', { required: 'Requerido' })}
                    type="password"
                    placeholder="••••••••"
                    className="w-full px-4 py-3.5 rounded-2xl border border-gray-200 bg-gray-50/30 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Confirmar Contraseña</label>
                  <input
                    {...register('password_confirm', { required: 'Requerido' })}
                    type="password"
                    placeholder="••••••••"
                    className="w-full px-4 py-3.5 rounded-2xl border border-gray-200 bg-gray-50/30 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-bold"
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex items-center justify-end gap-5 pt-10 border-t border-gray-100 mt-10">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-8 py-4 rounded-2xl text-sm font-black text-gray-500 hover:bg-gray-100 transition-all active:scale-95"
          >
            Cancelar
          </button>
        )}
        <button
          type="submit"
          disabled={loading}
          className="px-12 py-4 bg-blue-600 text-white rounded-2xl text-sm font-black shadow-2xl shadow-blue-500/30 hover:bg-blue-700 active:scale-95 transition-all flex items-center gap-3"
        >
          {loading ? (
            <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <Save className="w-5 h-5" />
              {initialData ? 'Guardar Cambios' : 'Registrar Usuario'}
            </>
          )}
        </button>
      </div>
    </form>
  );
};
