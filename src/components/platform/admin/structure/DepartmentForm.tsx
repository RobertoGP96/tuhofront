import { useDepartmentMutations } from '@/hooks/platform/use-departments';
import type { CreateDepartmentData, DepartmentDetail } from '@/types/department';
import { Briefcase, Save, X } from 'lucide-react';
import React from 'react';
import { useForm } from 'react-hook-form';

interface DepartmentFormProps {
  initialData?: DepartmentDetail;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const DepartmentForm: React.FC<DepartmentFormProps> = ({
  initialData,
  onSuccess,
  onCancel,
}) => {
  const { createDepartment, updateDepartment } = useDepartmentMutations();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateDepartmentData>({
    defaultValues: initialData
      ? {
          name: initialData.name,
          code: initialData.code,
          description: initialData.description || '',
          parent_department: initialData.parent_department,
          manager: initialData.manager,
          contact_email: initialData.contact_email,
          contact_phone: initialData.contact_phone,
          location: initialData.location,
        }
      : {},
  });

  const onSubmit = async (data: CreateDepartmentData) => {
    try {
      if (initialData) {
        await updateDepartment.mutateAsync({ id: initialData.id, data: data as any });
      } else {
        await createDepartment.mutateAsync(data);
      }
      onSuccess?.();
    } catch (err: any) {
      // Error handled by mutation
    }
  };

  const loading = createDepartment.isPending || updateDepartment.isPending;

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6 bg-white p-8 rounded-2xl shadow-xl border border-gray-100 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto"
    >
      <div className="flex items-center justify-between border-b pb-6 mb-6">
        <div>
          <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
            <div className="p-2 bg-indigo-50 rounded-lg">
              <Briefcase className="w-6 h-6 text-indigo-600" />
            </div>
            {initialData ? 'Editar Departamento' : 'Nuevo Departamento'}
          </h2>
          <p className="text-gray-500 font-medium mt-1">Configura las unidades administrativas principales.</p>
        </div>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-400" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Name */}
        <div className="md:col-span-2 space-y-1.5">
          <label className="block text-sm font-bold text-gray-700">Nombre del Departamento</label>
          <input
            {...register('name', { required: 'El nombre es obligatorio' })}
            placeholder="Ej: Dirección de Tecnología y Sistemas"
            className={`w-full px-4 py-3 rounded-xl border focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none font-medium ${
              errors.name ? 'border-red-400' : 'border-gray-200 focus:border-indigo-500'
            }`}
          />
          {errors.name && <p className="text-xs text-red-500 font-bold">{errors.name.message}</p>}
        </div>

        {/* Code */}
        <div className="space-y-1.5">
          <label className="block text-sm font-bold text-gray-700">Código</label>
          <input
            {...register('code', { required: 'El código es obligatorio' })}
            placeholder="Ej: DTS-001"
            disabled={!!initialData}
            className={`w-full px-4 py-3 rounded-xl border focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none font-medium disabled:bg-gray-50 disabled:text-gray-400 ${
              errors.code ? 'border-red-400' : 'border-gray-200 focus:border-indigo-500'
            }`}
          />
          {errors.code && <p className="text-xs text-red-500 font-bold">{errors.code.message}</p>}
        </div>

        {/* Location */}
        <div className="space-y-1.5">
          <label className="block text-sm font-bold text-gray-700">Ubicación física</label>
          <input
            {...register('location')}
            placeholder="Ej: Edificio Central, Ala Norte"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none font-medium"
          />
        </div>

        {/* Contact Email */}
        <div className="space-y-1.5">
          <label className="block text-sm font-bold text-gray-700">Email de contacto</label>
          <input
            {...register('contact_email')}
            type="email"
            placeholder="email@uho.edu.cu"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none font-medium"
          />
        </div>

        {/* Contact Phone */}
        <div className="space-y-1.5">
          <label className="block text-sm font-bold text-gray-700">Teléfono</label>
          <input
            {...register('contact_phone')}
            placeholder="+53 ..."
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none font-medium"
          />
        </div>

        {/* Description */}
        <div className="md:col-span-2 space-y-1.5">
          <label className="block text-sm font-bold text-gray-700">Descripción</label>
          <textarea
            {...register('description')}
            rows={3}
            placeholder="Describe las responsabilidades del departamento..."
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none resize-none font-medium"
          />
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex items-center justify-end gap-4 pt-8 border-t border-gray-100 mt-8">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-100 transition-colors"
          >
            Cancelar
          </button>
        )}
        <button
          type="submit"
          disabled={loading}
          className="px-10 py-3 bg-indigo-600 text-white rounded-xl text-sm font-black shadow-xl shadow-indigo-500/20 hover:bg-indigo-700 active:scale-95 transition-all flex items-center gap-2"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <Save className="w-4 h-4" />
              {initialData ? 'Actualizar Departamento' : 'Crear Departamento'}
            </>
          )}
        </button>
      </div>
    </form>
  );
};
