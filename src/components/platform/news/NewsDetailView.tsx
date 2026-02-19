import type { NewsCategory, NewsDetail } from '@/types/news';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { ArrowLeft, Calendar, Printer, Share2, Tag, User } from 'lucide-react';
import React from 'react';

interface NewsViewProps {
  news: NewsDetail;
  onBack?: () => void;
}

const CATEGORY_LABELS: Record<NewsCategory, string> = {
  GENERAL: 'General',
  ACADEMIC: 'Académico',
  ADMINISTRATIVE: 'Administrativo',
  MANAGEMENT: 'Gestión',
  STUDENT: 'Estudiantil',
  CULTURAL: 'Cultural',
  SPORTS: 'Deportes',
  RESEARCH: 'Investigación',
  EXTENSION: 'Extensión',
};

export const NewsDetailView: React.FC<NewsViewProps> = ({ news, onBack }) => {
  const formattedDate = format(new Date(news.created_at), "EEEE, d 'de' MMMM 'de' yyyy", { locale: es });

  return (
    <article className="max-w-4xl mx-auto bg-white rounded-3xl overflow-hidden shadow-2xl shadow-blue-900/5 animate-in fade-in slide-in-from-bottom-8 duration-700">
      {/* Top Navigation Bar */}
      <div className="p-4 border-b flex items-center justify-between bg-gray-50/50">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-blue-600 transition-colors py-2 px-4 rounded-xl hover:bg-blue-50"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a la lista
        </button>
        <div className="flex items-center gap-2">
           <button className="p-2.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
             <Share2 className="w-5 h-5" />
           </button>
           <button className="p-2.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all" onClick={() => window.print()}>
             <Printer className="w-5 h-5" />
           </button>
        </div>
      </div>

      {/* Featured Image */}
      {news.header_image && (
        <div className="relative h-[400px] w-full">
          <img
            src={news.header_image}
            alt={news.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-white to-transparent" />
        </div>
      )}

      {/* Content Body */}
      <div className="px-6 md:px-12 py-8 -mt-16 relative">
        {/* Meta Info */}
        <div className="flex flex-wrap items-center gap-4 mb-8">
          <div className="bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg shadow-blue-500/30">
            {CATEGORY_LABELS[news.category]}
          </div>
          <div className="flex items-center gap-2 text-gray-400 text-sm font-medium">
            <Calendar className="w-4 h-4" />
            <span className="capitalize">{formattedDate}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-400 text-sm font-medium">
            <User className="w-4 h-4" />
            <span>Por: {news.author?.name || 'Sistema'}</span>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl md:text-5xl font-black text-gray-900 leading-tight mb-6">
          {news.title}
        </h1>

        {/* Summary (Highlighted) */}
        <p className="text-xl text-gray-600 font-medium leading-relaxed mb-10 border-l-4 border-blue-500 pl-6 italic">
          {news.summary}
        </p>

        {/* Main Content */}
        <div className="prose prose-lg max-w-none text-gray-700 leading-loose space-y-6">
          {news.body.split('\n').map((paragraph, idx) => (
            paragraph.trim() && <p key={idx}>{paragraph}</p>
          ))}
        </div>

        {/* Tags */}
        {news.tag_list && news.tag_list.length > 0 && (
          <div className="mt-12 pt-8 border-t flex flex-wrap gap-3">
             <div className="w-full text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2">
               <Tag className="w-3.5 h-3.5" />
               Etiquetas relacionadas
             </div>
             {news.tag_list.map((tag) => (
               <span
                 key={tag}
                 className="px-4 py-2 bg-gray-100 text-gray-600 rounded-xl text-sm font-bold hover:bg-blue-600 hover:text-white transition-all cursor-pointer"
               >
                 #{tag}
               </span>
             ))}
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="px-6 md:px-12 py-10 bg-gray-50 border-t flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
           {/* Placeholder for author avatar */}
           <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
             {news.author?.name?.charAt(0) || 'U'}
           </div>
           <div>
             <div className="text-sm font-bold text-gray-900">{news.author?.name || 'Sistema Universidad'}</div>
             <div className="text-xs text-gray-500">Editor de Contenido - Universidad de Holguín</div>
           </div>
        </div>
        <div className="text-xs text-gray-400 italic">
          Última actualización: {format(new Date(news.updated_at), "d/MM/yyyy HH:mm")}
        </div>
      </div>
    </article>
  );
};
