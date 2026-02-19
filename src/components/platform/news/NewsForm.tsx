import { useNewsMutations } from '@/hooks/platform/use-news';
import type { CreateNewsData, NewsCategory, NewsDetail, NewsStatus } from '@/types/news';
import { Camera, FileText, Info, Save, X } from 'lucide-react';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';

interface NewsFormProps {
  initialData?: NewsDetail;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const CATEGORIES: { value: NewsCategory; label: string }[] = [
  { value: 'GENERAL', label: 'General' },
  { value: 'ACADEMIC', label: 'Académico' },
  { value: 'ADMINISTRATIVE', label: 'Administrativo' },
  { value: 'MANAGEMENT', label: 'Gestión' },
  { value: 'STUDENT', label: 'Estudiantil' },
  { value: 'CULTURAL', label: 'Cultural' },
  { value: 'SPORTS', label: 'Deportes' },
  { value: 'RESEARCH', label: 'Investigación' },
  { value: 'EXTENSION', label: 'Extensión' },
];

const STATUSES: { value: NewsStatus; label: string }[] = [
  { value: 'DRAFT', label: 'Borrador' },
  { value: 'PUBLISHED', label: 'Publicado' },
  { value: 'ARCHIVED', label: 'Archivado' },
];

export const NewsForm: React.FC<NewsFormProps> = ({
  initialData,
  onSuccess,
  onCancel,
}) => {
  const { createNews, updateNews } = useNewsMutations();
  const [imagePreview, setImagePreview] = useState<string | null>(
    typeof initialData?.header_image === 'string' ? initialData.header_image : null
  );

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CreateNewsData>({
    defaultValues: initialData
      ? {
          title: initialData.title,
          summary: initialData.summary,
          body: initialData.body,
          category: initialData.category,
          status: initialData.status,
          featured: initialData.featured,
          tags: initialData.tags,
          is_published: initialData.is_published,
        }
      : {
          category: 'GENERAL',
          status: 'DRAFT',
          featured: false,
          tags: '',
          body: '',
          is_published: false,
        },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setValue('header_image', file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: CreateNewsData) => {
    try {
      if (initialData) {
        await updateNews.mutateAsync({ id: initialData.id, data });
      } else {
        await createNews.mutateAsync(data);
      }
      onSuccess?.();
    } catch (err: any) {
      // Error is handled by the mutation or we can add a local state if preferred
    }
  };

  const loading = createNews.isPending || updateNews.isPending;
  const error = (createNews.error as any)?.message || (updateNews.error as any)?.message;

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6 bg-white p-6 rounded-xl shadow-lg border border-gray-100 animate-in fade-in slide-in-from-bottom-4 duration-500"
    >
      <div className="flex items-center justify-between border-b pb-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            {initialData ? 'Editar Noticia' : 'Nueva Noticia'}
          </h2>
          <p className="text-sm text-gray-500">Completa los campos para publicar contenido informativo.</p>
        </div>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        )}
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm flex items-center gap-2">
          <Info className="w-4 h-4" />
          {error}
        </div>
      )}

      {/* Header Image Upload */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Imagen de cabecera</label>
        <div className="relative group">
          <div
            className={`h-48 w-full rounded-xl border-2 border-dashed transition-all flex flex-col items-center justify-center overflow-hidden bg-gray-50 ${
              imagePreview ? 'border-transparent' : 'border-gray-200 hover:border-blue-400'
            }`}
          >
            {imagePreview ? (
              <>
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button
                    type="button"
                    onClick={() => {
                      setImagePreview(null);
                      setValue('header_image', null as any);
                    }}
                    className="bg-white/20 backdrop-blur-md p-2 rounded-full hover:bg-white/40 text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center gap-2 text-gray-400">
                <Camera className="w-10 h-10" />
                <span className="text-xs">Click para subir imagen (PNG, JPG)</span>
              </div>
            )}
            <input
              type="file"
              className="absolute inset-0 opacity-0 cursor-pointer"
              accept="image/*"
              onChange={handleImageChange}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Title */}
        <div className="md:col-span-2 space-y-1">
          <label className="block text-sm font-medium text-gray-700">Título</label>
          <input
            {...register('title', { required: 'El título es obligatorio' })}
            placeholder="Escribe un título llamativo..."
            className={`w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-blue-500/20 transition-all outline-none ${
              errors.title ? 'border-red-400' : 'border-gray-200 focus:border-blue-500'
            }`}
          />
          {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>}
        </div>

        {/* Summary */}
        <div className="md:col-span-2 space-y-1">
          <label className="block text-sm font-medium text-gray-700">Resumen</label>
          <textarea
            {...register('summary', { required: 'El resumen es obligatorio' })}
            rows={2}
            placeholder="Breve descripción para la vista previa..."
            className={`w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-blue-500/20 transition-all outline-none resize-none ${
              errors.summary ? 'border-red-400' : 'border-gray-200 focus:border-blue-500'
            }`}
          />
          {errors.summary && <p className="text-xs text-red-500 mt-1">{errors.summary.message}</p>}
        </div>

        {/* Category */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Categoría</label>
          <select
            {...register('category')}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all bg-white"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        {/* Status */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Estado</label>
          <select
            {...register('status')}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all bg-white"
          >
            {STATUSES.map((stat) => (
              <option key={stat.value} value={stat.value}>
                {stat.label}
              </option>
            ))}
          </select>
        </div>

        {/* Content */}
        <div className="md:col-span-2 space-y-1">
          <label className="block text-sm font-medium text-gray-700">Contenido Completo</label>
          <textarea
            {...register('body', { required: 'El contenido es obligatorio' })}
            rows={6}
            placeholder="Cuerpo de la noticia..."
            className={`w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-blue-500/20 transition-all outline-none ${
              errors.body ? 'border-red-400' : 'border-gray-200 focus:border-blue-500'
            }`}
          />
          {errors.body && <p className="text-xs text-red-500 mt-1">{errors.body.message}</p>}
        </div>

        {/* Featured toggle */}
        <div className="md:col-span-2 flex items-center gap-3 p-4 bg-blue-50/50 rounded-xl border border-blue-100">
          <div className="flex items-center h-5">
            <input
              {...register('featured')}
              type="checkbox"
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
          </div>
          <div className="ml-2 text-sm">
            <label className="font-medium text-blue-900 flex items-center gap-1.5 cursor-pointer">
              Marcar como destacada
              <Info className="w-3.5 h-3.5 text-blue-400" />
            </label>
            <p className="text-blue-700/70 text-xs">Aparecerá en la sección principal del portal.</p>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex items-center justify-end gap-3 pt-6 border-t mt-8">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
          >
            Cancelar
          </button>
        )}
        <button
          type="submit"
          disabled={loading}
          className="px-8 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-bold shadow-lg shadow-blue-500/20 hover:bg-blue-700 active:transform active:scale-95 transition-all flex items-center gap-2"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <Save className="w-4 h-4" />
              {initialData ? 'Guardar Cambios' : 'Publicar Noticia'}
            </>
          )}
        </button>
      </div>
    </form>
  );
};
