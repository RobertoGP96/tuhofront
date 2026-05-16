import React, { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Clock,
  ImageOff,
  Loader2,
  Tag,
  User,
} from 'lucide-react';
import { platformService, type NewsDetailItem, type NewsItem } from '@/services/platform.service';
import { formatDate } from '@/utils';

const CATEGORY_LABELS: Record<string, string> = {
  GENERAL: 'General',
  ACADEMIC: 'Academia',
  MANAGEMENT: 'Administrativa',
  STUDENT: 'Estudiantil',
  CULTURAL: 'Cultural',
  SPORTS: 'Deportiva',
  RESEARCH: 'Investigación',
  EXTENSION: 'Extensión',
};

function NewsDetailSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-72 md:h-96 w-full bg-gray-200 rounded-2xl" />
      <div className="space-y-3">
        <div className="h-4 w-24 bg-gray-200 rounded" />
        <div className="h-8 w-3/4 bg-gray-200 rounded" />
        <div className="h-4 w-1/2 bg-gray-200 rounded" />
      </div>
      <div className="space-y-2">
        <div className="h-3 w-full bg-gray-200 rounded" />
        <div className="h-3 w-full bg-gray-200 rounded" />
        <div className="h-3 w-5/6 bg-gray-200 rounded" />
      </div>
    </div>
  );
}

function RelatedCard({ item }: { item: NewsItem }) {
  return (
    <Link
      to={`/news/${item.slug}`}
      className="group block bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-lg transition-all"
    >
      {item.header_image ? (
        <img
          src={item.header_image}
          alt={item.title}
          className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-500"
        />
      ) : (
        <div className="w-full h-32 bg-gray-100 flex items-center justify-center">
          <ImageOff size={24} className="text-gray-300" />
        </div>
      )}
      <div className="p-3">
        <span className="text-[10px] font-bold text-secondary-lime uppercase tracking-wider">
          {CATEGORY_LABELS[item.category] ?? item.category}
        </span>
        <h4 className="font-bold text-primary-navy text-sm leading-snug mt-1 line-clamp-2 group-hover:text-secondary-lime transition-colors">
          {item.title}
        </h4>
      </div>
    </Link>
  );
}

const NewsDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [news, setNews] = useState<NewsDetailItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNews = useCallback(async (newsSlug: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await platformService.getNewsBySlug(newsSlug);
      setNews(data);
    } catch (err) {
      console.error('Error cargando noticia:', err);
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 404) {
        setError('La noticia que buscas no existe o fue retirada.');
      } else {
        setError('No se pudo cargar la noticia. Intente nuevamente.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (slug) {
      window.scrollTo({ top: 0, behavior: 'auto' });
      fetchNews(slug);
    }
  }, [slug, fetchNews]);

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-4xl mx-auto p-4 md:p-8">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-primary-navy mb-6"
        >
          <ArrowLeft size={16} />
          Volver
        </button>

        {loading && <NewsDetailSkeleton />}

        {!loading && error && (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 flex flex-col items-center gap-4 text-center">
            <AlertCircle size={48} className="text-red-400" />
            <p className="text-gray-600 font-medium">{error}</p>
            <div className="flex gap-3">
              <Link
                to="/news"
                className="px-5 py-2 bg-primary-navy text-white rounded-xl text-sm font-bold hover:bg-primary-navy/90"
              >
                Ver todas las noticias
              </Link>
              {slug && (
                <button
                  onClick={() => fetchNews(slug)}
                  className="px-5 py-2 bg-white border border-gray-200 text-primary-navy rounded-xl text-sm font-bold hover:bg-gray-50"
                >
                  Reintentar
                </button>
              )}
            </div>
          </div>
        )}

        {!loading && !error && news && (
          <article className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
            {news.header_image ? (
              <img
                src={news.header_image}
                alt={news.title}
                className="w-full h-72 md:h-96 object-cover"
              />
            ) : (
              <div className="w-full h-72 md:h-96 bg-gradient-to-br from-primary-navy to-primary-navy/70" />
            )}

            <div className="p-6 md:p-10 space-y-6">
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-block px-3 py-1 bg-secondary-lime/15 text-secondary-lime font-bold text-[10px] uppercase rounded">
                  {CATEGORY_LABELS[news.category] ?? news.category}
                </span>
                {news.featured && (
                  <span className="inline-block px-3 py-1 bg-primary-navy text-white font-bold text-[10px] uppercase rounded">
                    Destacado
                  </span>
                )}
              </div>

              <h1 className="text-2xl md:text-4xl font-black text-primary-navy leading-tight">
                {news.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 border-y border-gray-100 py-3">
                {news.author_name && (
                  <span className="inline-flex items-center gap-1.5">
                    <User size={14} className="text-gray-400" />
                    {news.author_name}
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5">
                  <Clock size={14} className="text-gray-400" />
                  {formatDate(news.publication_date ?? news.created_at)}
                </span>
                {news.read_time > 0 && (
                  <span className="inline-flex items-center gap-1.5">
                    <Loader2 size={14} className="text-gray-400" />
                    {news.read_time} min de lectura
                  </span>
                )}
              </div>

              {news.summary && (
                <p className="text-lg text-gray-600 italic leading-relaxed border-l-4 border-secondary-lime pl-4">
                  {news.summary}
                </p>
              )}

              <div
                className="prose prose-sm md:prose-base max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap"
                dangerouslySetInnerHTML={{ __html: news.body }}
              />

              {news.tag_list.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-gray-100">
                  <Tag size={14} className="text-gray-400" />
                  {news.tag_list.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full font-medium"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </article>
        )}

        {!loading && !error && news && news.related_news.length > 0 && (
          <section className="mt-12">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-primary-navy">Noticias relacionadas</h3>
              <Link
                to="/news"
                className="text-sm text-primary-navy hover:text-secondary-lime font-bold inline-flex items-center gap-1"
              >
                Ver todas
                <ArrowRight size={14} />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {news.related_news.map((item) => (
                <RelatedCard key={item.id} item={item} />
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default NewsDetail;
