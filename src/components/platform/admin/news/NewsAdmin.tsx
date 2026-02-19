import { NewsForm } from '@/components/platform/news/NewsForm';
import { NewsList } from '@/components/platform/news/NewsList';
import { useNewsDetail } from '@/hooks/platform/use-news';
import type { NewsListItem } from '@/types/news';
import { Loader2, Newspaper, Plus } from 'lucide-react';
import React, { useState } from 'react';

export const NewsAdmin: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [selectedNewsId, setSelectedNewsId] = useState<number | string | undefined>(undefined);
  
  const { data: selectedNews, isLoading: isLoadingDetail } = useNewsDetail(selectedNewsId || '');

  const handleCreate = () => {
    setSelectedNewsId(undefined);
    setIsEditing(true);
  };

  const handleEdit = (news: NewsListItem) => {
    setSelectedNewsId(news.id);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setSelectedNewsId(undefined);
  };

  const handleSuccess = () => {
    setIsEditing(false);
    setSelectedNewsId(undefined);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Newspaper className="w-8 h-8 text-blue-600" />
            Gestión de Noticias
          </h1>
          <p className="text-gray-500 mt-1">Administra las noticias y anuncios de la plataforma.</p>
        </div>
        {!isEditing && (
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all active:scale-95"
          >
            <Plus className="w-5 h-5" />
            Nueva Noticia
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="max-w-4xl mx-auto">
          {isLoadingDetail ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
              <p className="text-gray-500 animate-pulse font-medium">Cargando detalles de la noticia...</p>
            </div>
          ) : (
            <NewsForm
              initialData={selectedNews}
              onSuccess={handleSuccess}
              onCancel={handleCancel}
            />
          )}
        </div>
      ) : (
        <NewsList 
          isAdmin={true} 
          onEdit={handleEdit}
        />
      )}
    </div>
  );
};
