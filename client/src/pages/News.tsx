import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Clock, ArrowRight, AlertCircle, ImageOff } from 'lucide-react';
import { platformService, type NewsCategory, type NewsItem } from '@/services/platform.service';

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

const CATEGORIES: Array<{ id: string; label: string }> = [
  { id: 'todas', label: 'Todas' },
  ...Object.entries(CATEGORY_LABELS).map(([id, label]) => ({ id, label })),
];

const PAGE_SIZE = 100;

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function getExcerpt(item: NewsItem): string {
  if (item.summary) return item.summary;
  return item.body.replace(/<[^>]+>/g, '').slice(0, 150) + '...';
}

function NewsCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm animate-pulse">
      <div className="w-full h-48 bg-gray-200" />
      <div className="p-4 space-y-3">
        <div className="h-3 bg-gray-200 rounded w-16" />
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-full" />
          <div className="h-4 bg-gray-200 rounded w-3/4" />
        </div>
        <div className="h-3 bg-gray-200 rounded w-full" />
        <div className="h-3 bg-gray-200 rounded w-5/6" />
        <div className="pt-2 border-t border-gray-100 flex justify-between">
          <div className="h-3 bg-gray-200 rounded w-20" />
          <div className="h-3 bg-gray-200 rounded w-16" />
        </div>
      </div>
    </div>
  );
}

function NewsImagePlaceholder() {
  return (
    <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
      <ImageOff size={32} className="text-gray-300" />
    </div>
  );
}

const News: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('todas');
  const [news, setNews] = useState<NewsItem[]>([]);
  const [featuredNews, setFeaturedNews] = useState<NewsItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounce search input
  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [searchTerm]);

  const fetchNews = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params: Parameters<typeof platformService.getNews>[0] = {
        page: 1,
        page_size: PAGE_SIZE,
        is_published: true,
      };
      if (debouncedSearch) params.search = debouncedSearch;
      if (selectedCategory !== 'todas') params.category = selectedCategory as NewsCategory;

      const result = await platformService.getNews(params);
      const items = result.results;

      setNews(items);
      setFeaturedNews(items.find(i => i.featured) ?? null);
    } catch (err) {
      console.error('Error cargando noticias:', err);
      const apiMsg = (err as { response?: { data?: { detail?: string } }; message?: string });
      const detail = apiMsg?.response?.data?.detail;
      setError(detail || apiMsg?.message || 'No se pudieron cargar las noticias. Intente nuevamente.');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, selectedCategory]);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  const regularNews = featuredNews
    ? news.filter(item => item.id !== featuredNews.id)
    : news;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Search and Filter Section */}
      <section className="sticky top-16 z-40 bg-white border-b border-gray-200 px-4 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto space-y-4">
          {/* Search Bar */}
          <div className="relative max-w-2xl mx-auto">
            <Search
              size={20}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Buscar noticias..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-secondary-lime focus:border-transparent outline-none shadow-sm"
            />
          </div>

          {/* Category Filters */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {CATEGORIES.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  category.id === selectedCategory
                    ? 'bg-primary-navy text-white'
                    : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-4 pb-24">
        {/* Error State */}
        {error && (
          <div className="my-8 flex flex-col items-center gap-3 text-center">
            <AlertCircle size={40} className="text-red-400" />
            <p className="text-gray-600">{error}</p>
            <button
              onClick={() => fetchNews(1, false)}
              className="px-6 py-2 bg-primary-navy text-white rounded-xl text-sm font-bold hover:bg-primary-navy/90"
            >
              Reintentar
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading && !error && (
          <>
            {/* Featured skeleton */}
            <div className="mb-8 rounded-2xl overflow-hidden bg-gray-200 animate-pulse h-[320px] md:h-[400px]" />
            {/* Grid skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <NewsCardSkeleton key={i} />
              ))}
            </div>
          </>
        )}

        {/* Content */}
        {!loading && !error && (
          <>
            {/* Featured News */}
            {featuredNews && (
              <section className="mb-8">
                <Link
                  to={`/news/${featuredNews.slug}`}
                  className="relative rounded-2xl overflow-hidden shadow-lg group block"
                >
                  {featuredNews.header_image ? (
                    <img
                      src={featuredNews.header_image}
                      alt={featuredNews.title}
                      className="w-full h-[320px] md:h-[400px] object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-[320px] md:h-[400px] bg-gradient-to-br from-primary-navy to-primary-navy/70" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <span className="inline-block px-3 py-1 bg-secondary-lime text-primary-navy font-bold text-[10px] uppercase rounded mb-3">
                      Destacado
                    </span>
                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-2 leading-tight">
                      {featuredNews.title}
                    </h2>
                    <p className="text-gray-200 text-sm md:text-base line-clamp-2 mb-4 max-w-3xl">
                      {getExcerpt(featuredNews)}
                    </p>
                    <span className="inline-flex items-center gap-2 text-secondary-lime font-bold text-sm uppercase tracking-wider">
                      Leer más
                      <ArrowRight size={16} />
                    </span>
                  </div>
                </Link>
              </section>
            )}

            {/* News Grid */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-primary-navy">Últimas Noticias</h3>
                <span className="text-xs text-gray-400 font-medium">
                  {news.length > 0 ? `${news.length} resultado${news.length !== 1 ? 's' : ''}` : 'Sin resultados'}
                </span>
              </div>

              {regularNews.length === 0 && !featuredNews ? (
                <div className="py-16 flex flex-col items-center gap-3 text-center">
                  <Search size={40} className="text-gray-300" />
                  <p className="text-gray-500 font-medium">No se encontraron noticias</p>
                  <p className="text-sm text-gray-400">Intente con otros filtros o términos de búsqueda</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {regularNews.map((item) => (
                    <Link
                      key={item.id}
                      to={`/news/${item.slug}`}
                      className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col"
                    >
                      {item.header_image ? (
                        <img
                          src={item.header_image}
                          alt={item.title}
                          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <NewsImagePlaceholder />
                      )}
                      <div className="p-4 flex flex-col flex-grow">
                        <span className="text-[10px] font-bold text-secondary-lime uppercase tracking-wider mb-2">
                          {CATEGORY_LABELS[item.category] ?? item.category}
                        </span>
                        <h4 className="font-bold text-primary-navy text-lg mb-2 leading-snug group-hover:text-secondary-lime transition-colors">
                          {item.title}
                        </h4>
                        <p className="text-sm text-gray-500 line-clamp-3 mb-4 flex-grow">
                          {getExcerpt(item)}
                        </p>
                        <div className="mt-auto pt-4 border-t border-gray-100 flex justify-between items-center">
                          <div className="flex items-center gap-1 text-xs text-gray-400">
                            <Clock size={12} />
                            <span>{formatDate(item.publication_date ?? item.created_at)}</span>
                          </div>
                          <span className="text-sm font-bold text-primary-navy group-hover:text-secondary-lime transition-colors flex items-center gap-1">
                            Leer más
                            <ArrowRight size={14} />
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
};

export default News;
