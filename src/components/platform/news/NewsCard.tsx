import type { NewsCategory, NewsListItem } from '@/types/news';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar, ChevronRight, Edit3, Eye, Star, Trash2 } from 'lucide-react';
import React from 'react';

interface NewsCardProps {
  news: NewsListItem;
  isAdmin?: boolean;
  onEdit?: (news: NewsListItem) => void;
  onDelete?: (id: number | string) => void;
  onView?: (news: NewsListItem) => void;
}

const CATEGORY_STYLES: Record<NewsCategory, { bg: string; text: string; label: string }> = {
  GENERAL: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'General' },
  ACADEMIC: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Académico' },
  ADMINISTRATIVE: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Adm.' },
  MANAGEMENT: { bg: 'bg-indigo-100', text: 'text-indigo-700', label: 'Gestión' },
  STUDENT: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Estudiantil' },
  CULTURAL: { bg: 'bg-pink-100', text: 'text-pink-700', label: 'Cultural' },
  SPORTS: { bg: 'bg-green-100', text: 'text-green-700', label: 'Deportes' },
  RESEARCH: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Investigación' },
  EXTENSION: { bg: 'bg-teal-100', text: 'text-teal-700', label: 'Extensión' },
};

export const NewsCard: React.FC<NewsCardProps> = ({
  news,
  isAdmin,
  onEdit,
  onDelete,
  onView,
}) => {
  const catStyle = CATEGORY_STYLES[news.category] || CATEGORY_STYLES.GENERAL;
  const formattedDate = format(new Date(news.created_at), "d 'de' MMMM, yyyy", { locale: es });

  return (
    <div className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-gray-100 flex flex-col h-full">
      {/* Image Header with Badge */}
      <div className="relative h-48 overflow-hidden">
        {news.header_image ? (
          <img
            src={news.header_image}
            alt={news.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center p-6 text-center">
            <span className="text-white font-bold text-lg opacity-80">{news.title}</span>
          </div>
        )}
        
        {/* Category Badge */}
        <div className={`absolute top-4 left-4 ${catStyle.bg} ${catStyle.text} px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm backdrop-blur-md bg-opacity-90`}>
          {catStyle.label}
        </div>

        {/* Featured Star */}
        {news.featured && (
          <div className="absolute top-4 right-4 bg-yellow-400 text-yellow-900 p-1.5 rounded-full shadow-lg ring-2 ring-white">
            <Star className="w-3.5 h-3.5 fill-current" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-grow">
        <div className="flex items-center gap-2 text-gray-400 text-[11px] mb-3">
          <Calendar className="w-3 h-3" />
          <span>{formattedDate}</span>
        </div>

        <h3 className="text-lg font-bold text-gray-800 line-clamp-2 mb-3 group-hover:text-blue-600 transition-colors">
          {news.title}
        </h3>

        <p className="text-sm text-gray-500 line-clamp-3 mb-6 flex-grow leading-relaxed">
          {news.summary}
        </p>

        {/* Tags */}
        {news.tag_list && news.tag_list.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {news.tag_list.slice(0, 3).map((tag) => (
              <span key={tag} className="text-[10px] text-gray-400 font-medium">
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-50 mt-auto">
          {isAdmin ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onEdit?.(news)}
                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                title="Editar"
              >
                <Edit3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDelete?.(news.id)}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                title="Eliminar"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => onView?.(news as any)}
                className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                title="Ver detalles"
              >
                <Eye className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => onView?.(news as any)}
              className="text-blue-600 text-sm font-bold flex items-center gap-1 group/btn"
            >
              Leer más
              <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
            </button>
          )}

          {!isAdmin && news.author_name && (
             <div className="text-[10px] text-gray-400 italic">
               Por: {news.author_name}
             </div>
          )}
        </div>
      </div>
    </div>
  );
};
