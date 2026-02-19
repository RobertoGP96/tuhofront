import { useProcedureMutations } from '@/hooks/platform/use-procedures';
import type { ProcedureDetail, ProcedureState } from '@/types/procedure';
import { Info, RefreshCw, Save, X } from 'lucide-react';
import React from 'react';
import { useForm } from 'react-hook-form';

interface ProcedureFormProps {
  initialData?: ProcedureDetail;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const STATES: { value: ProcedureState; label: string }[] = [
  { value: 'BORRADOR', label: 'Borrador' },
  { value: 'ENVIADO', label: 'Enviado' },
  { value: 'EN_PROCESO', label: 'En Proceso' },
  { value: 'REQUIERE_INFO', label: 'Requiere Información' },
  { value: 'APROBADO', label: 'Aprobado' },
  { value: 'RECHAZADO', label: 'Rechazado' },
  { value: 'FINALIZADO', label: 'Finalizado' },
];

export const ProcedureForm: React.FC<ProcedureFormProps> = ({
  initialData,
  onSuccess,
  onCancel,
}) => {
  const { transitionState } = useProcedureMutations();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      state: initialData?.state || 'ENVIADO',
      observation: '',
    },
  });

  const onSubmit = async (data: { state: string; observation: string }) => {
    if (!initialData) return;
    try {
      await transitionState.mutateAsync({ 
        id: initialData.id, 
        state: data.state, 
        observation: data.observation 
      });
      onSuccess?.();
    } catch (err: any) {
      // Handled by mutation
    }
  };

  const loading = transitionState.isPending;

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6 bg-white p-8 rounded-2xl shadow-xl border border-gray-100 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl mx-auto"
    >
      <div className="flex items-center justify-between border-b pb-6 mb-6">
        <div>
          <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <RefreshCw className="w-6 h-6 text-blue-600" />
            </div>
            Gestionar Estado
          </h2>
          <p className="text-gray-500 font-medium mt-1">
            Trámite #{initialData?.follow_number}
          </p>
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

      <div className="space-y-6">
        {/* State */}
        <div className="space-y-1.5">
          <label className="block text-sm font-bold text-gray-700">Nuevo Estado</label>
          <select
            {...register('state', { required: 'El estado es obligatorio' })}
            className={`w-full px-4 py-3 rounded-xl border focus:ring-4 focus:ring-blue-500/10 transition-all outline-none font-medium bg-white ${
              errors.state ? 'border-red-400' : 'border-gray-200 focus:border-blue-500'
            }`}
          >
            {STATES.map((state) => (
              <option key={state.value} value={state.value}>
                {state.label}
              </option>
            ))}
          </select>
        </div>

        {/* Observation */}
        <div className="space-y-1.5">
          <label className="block text-sm font-bold text-gray-700">Observaciones / Comentario</label>
          <textarea
            {...register('observation')}
            rows={4}
            placeholder="Añade una nota sobre este cambio de estado..."
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none resize-none font-medium"
          />
          <p className="text-xs text-gray-400 flex items-center gap-1.5 mt-2">
            <Info className="w-3.5 h-3.5" />
            Esta nota será visible para el solicitante.
          </p>
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
              Actualizar Estado
            </>
          )}
        </button>
      </div>
    </form>
  );
};
