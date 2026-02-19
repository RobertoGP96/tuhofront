import type { NewsListItem } from '@/types/news';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
    Calendar,
    ChevronRight,
    Edit3,
    Eye,
    Image as ImageIcon,
    Tag,
    Trash2,
    User
} from 'lucide-react';
import React from 'react';

interface NewsRowProps {
  news: NewsListItem;
  isAdmin?: boolean;
  onEdit?: (news: NewsListItem) => void;
  onDelete?: (id: number | string) => void;
  onView?: (news: NewsListItem) => void;
}

export const NewsRow: React.FC<NewsRowProps> = ({
  news,
  isAdmin,
  onEdit,
  onDelete,
  onView,
}) => {
  const date = news.publication_date 
    ? format(new Date(news.publication_date), "d MMM, yyyy", { locale: es }) 
    : format(new Date(news.created_at), "d MMM, yyyy", { locale: es });

  return (
    <div className="group bg-white hover:bg-gray-50/50 border-b border-gray-100 last:border-0 transition-all duration-200">
      <div className="flex items-center px-6 py-4 gap-6">
        {/* News Image & Title */}
        <div className="flex items-center gap-4 flex-1 min-w-[400px]">
          <div className="relative shrink-0 w-16 h-12 rounded-lg overflow-hidden bg-gray-100">
            {news.header_image ? (
              <img 
                src={news.header_image} 
                alt={news.title} 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <ImageIcon className="w-5 h-5" />
              </div>
            )}
          </div>
          <div className="flex flex-col min-w-0">
            <h3 className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
              {news.title}
            </h3>
            <div className="flex items-center gap-3 mt-1">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 text-[10px] font-black text-blue-600 uppercase tracking-wider">
                <Tag className="w-3 h-3" />
                {news.category}
              </span>
              <span className="flex items-center gap-1 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                <Calendar className="w-3 h-3" />
                {date}
              </span>
            </div>
          </div>
        </div>

        {/* Author */}
        <div className="w-40 hidden lg:flex shrink-0 items-center gap-2">
          <div className="p-1.5 bg-gray-100 rounded-lg text-gray-400">
            <User className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-none mb-1">Autor</span>
            <span className="text-xs text-gray-700 font-medium truncate max-w-[120px]">
              {news.author_name || 'Admin'}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-1 min-w-[120px]">
          <button
            onClick={() => onView?.(news)}
            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-white rounded-lg transition-all active:scale-90"
            title="Ver noticia"
          >
            <Eye className="w-4 h-4" />
          </button>
          
          {isAdmin && (
            <>
              <button
                onClick={() => onEdit?.(news)}
                className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-white rounded-lg transition-all active:scale-90"
                title="Editar"
              >
                <Edit3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDelete?.(news.id)}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-white rounded-lg transition-all active:scale-90"
                title="Eliminar"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
          
          <ChevronRight className="w-4 h-4 text-gray-300 ml-2 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </div>
  );
};
