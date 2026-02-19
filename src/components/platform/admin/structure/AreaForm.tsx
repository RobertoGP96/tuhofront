import { useAreaMutations } from '@/hooks/platform/use-areas';
import { useDepartments } from '@/hooks/platform/use-departments';
import type { AreaDetail, CreateAreaData } from '@/types/area';
import { Building2, Save, X } from 'lucide-react';
import React from 'react';
import { useForm } from 'react-hook-form';

interface AreaFormProps {
  initialData?: AreaDetail;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const AreaForm: React.FC<AreaFormProps> = ({
  initialData,
  onSuccess,
  onCancel,
}) => {
  const { createArea, updateArea } = useAreaMutations();
  const { data: departmentsData } = useDepartments({ page_size: 100 });
  const departments = departmentsData?.results || [];

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateAreaData>({
    defaultValues: initialData
      ? {
          name: initialData.name,
          code: initialData.code,
          description: initialData.description || '',
          department: initialData.department,
          parent_area: initialData.parent_area,
          manager: initialData.manager,
          floor: initialData.floor,
          room: initialData.room,
          capacity: initialData.capacity,
          contact_email: initialData.contact_email,
          contact_phone: initialData.contact_phone,
          working_hours: initialData.working_hours,
        }
      : {
          department: '',
        },
  });

  const onSubmit = async (data: CreateAreaData) => {
    try {
      if (initialData) {
        await updateArea.mutateAsync({ id: initialData.id, data: data as any });
      } else {
        await createArea.mutateAsync(data);
      }
      onSuccess?.();
    } catch (err: any) {
      // Error handled by mutation
    }
  };

  const loading = createArea.isPending || updateArea.isPending;

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6 bg-white p-8 rounded-2xl shadow-xl border border-gray-100 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto"
    >
      <div className="flex items-center justify-between border-b pb-6 mb-6">
        <div>
          <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Building2 className="w-6 h-6 text-blue-600" />
            </div>
            {initialData ? 'Editar Área' : 'Nueva Área'}
          </h2>
          <p className="text-gray-500 font-medium mt-1">Define los detalles operativos de esta área institucional.</p>
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
          <label className="block text-sm font-bold text-gray-700">Nombre del Área</label>
          <input
            {...register('name', { required: 'El nombre es obligatorio' })}
            placeholder="Ej: Laboratorio de Computación 1"
            className={`w-full px-4 py-3 rounded-xl border focus:ring-4 focus:ring-blue-500/10 transition-all outline-none font-medium ${
              errors.name ? 'border-red-400' : 'border-gray-200 focus:border-blue-500'
            }`}
          />
          {errors.name && <p className="text-xs text-red-500 font-bold">{errors.name.message}</p>}
        </div>

        {/* Code */}
        <div className="space-y-1.5">
          <label className="block text-sm font-bold text-gray-700">Código</label>
          <input
            {...register('code', { required: 'El código es obligatorio' })}
            placeholder="Ej: LAB-COM-01"
            disabled={!!initialData}
            className={`w-full px-4 py-3 rounded-xl border focus:ring-4 focus:ring-blue-500/10 transition-all outline-none font-medium disabled:bg-gray-50 disabled:text-gray-400 ${
              errors.code ? 'border-red-400' : 'border-gray-200 focus:border-blue-500'
            }`}
          />
          {errors.code && <p className="text-xs text-red-500 font-bold">{errors.code.message}</p>}
        </div>

        {/* Department */}
        <div className="space-y-1.5">
          <label className="block text-sm font-bold text-gray-700">Departamento</label>
          <select
            {...register('department', { required: 'Debe seleccionar un departamento' })}
            className={`w-full px-4 py-3 rounded-xl border focus:ring-4 focus:ring-blue-500/10 transition-all outline-none font-medium bg-white ${
              errors.department ? 'border-red-400' : 'border-gray-200 focus:border-blue-500'
            }`}
          >
            <option value="">Seleccione un departamento...</option>
            {departments.map((dept) => (
              <option key={dept.id} value={dept.id}>
                {dept.name}
              </option>
            ))}
          </select>
          {errors.department && <p className="text-xs text-red-500 font-bold">{errors.department.message}</p>}
        </div>

        {/* Floor & Room */}
        <div className="space-y-1.5">
          <label className="block text-sm font-bold text-gray-700">Piso</label>
          <input
            {...register('floor')}
            placeholder="Ej: 2do Piso"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none font-medium"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-bold text-gray-700">Local / Aula</label>
          <input
            {...register('room')}
            placeholder="Ej: Aula 204"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none font-medium"
          />
        </div>

        {/* Description */}
        <div className="md:col-span-2 space-y-1.5">
          <label className="block text-sm font-bold text-gray-700">Descripción</label>
          <textarea
            {...register('description')}
            rows={3}
            placeholder="Describe el propósito o funciones del área..."
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none resize-none font-medium"
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
          className="px-10 py-3 bg-blue-600 text-white rounded-xl text-sm font-black shadow-xl shadow-blue-500/20 hover:bg-blue-700 active:scale-95 transition-all flex items-center gap-2"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <Save className="w-4 h-4" />
              {initialData ? 'Actualizar Área' : 'Registrar Área'}
            </>
          )}
        </button>
      </div>
    </form>
  );
};
