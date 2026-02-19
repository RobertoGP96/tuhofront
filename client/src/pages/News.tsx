import React, { useState } from 'react';
import { Search, Clock, ArrowRight } from 'lucide-react';

interface NewsItem {
  id: number;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  image: string;
  featured?: boolean;
}

const News: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('todas');
  const [news] = useState<NewsItem[]>([
    {
      id: 1,
      title: "Inauguración del nuevo Centro de Innovación Tecnológica",
      excerpt: "Un espacio de 2,000 metros cuadrados diseñado para fomentar la colaboración entre la academia y la industria local.",
      category: "destacado",
      date: "12 Oct, 2023",
      image: "https://images.unsplash.com/photo-1560472354-b33ff0c34a17?w=800&h=400&fit=crop",
      featured: true
    },
    {
      id: 2,
      title: "Avance científico en el departamento de Biomedicina",
      excerpt: "Investigadores de la UH publican hallazgos revolucionarios sobre la regeneración celular en la revista Science.",
      category: "investigacion",
      date: "12 Oct, 2023",
      image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&h=400&fit=crop"
    },
    {
      id: 3,
      title: "Semana de Bienvenida 2024: Actividades y Eventos",
      excerpt: "Preparamos una agenda completa para recibir a nuestros nuevos estudiantes con conciertos, ferias y talleres.",
      category: "vida-estudiantil",
      date: "08 Oct, 2023",
      image: "https://images.unsplash.com/photo-152358044983-297d0b9ff27?w=800&h=400&fit=crop"
    },
    {
      id: 4,
      title: "Nuevos convenios de intercambio internacional",
      excerpt: "La universidad firma alianzas con 15 instituciones europeas para programas de doble titulación.",
      category: "academia",
      date: "05 Oct, 2023",
      image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&h=400&fit=crop"
    }
  ]);

  const categories = [
    { id: 'todas', label: 'Todas', active: true },
    { id: 'academia', label: 'Academia', active: false },
    { id: 'investigacion', label: 'Investigación', active: false },
    { id: 'vida-estudiantil', label: 'Vida Estudiantil', active: false },
    { id: 'deportes', label: 'Deportes', active: false }
  ];

  const filteredNews = news.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'todas' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const featuredNews = news.find(item => item.featured);
  const regularNews = filteredNews.filter(item => !item.featured);

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
            {categories.map((category) => (
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
        {/* Featured News */}
        {featuredNews && (
          <section className="mb-8">
            <div className="relative rounded-2xl overflow-hidden shadow-lg group">
              <img
                src={featuredNews.image}
                alt={featuredNews.title}
                className="w-full h-[320px] md:h-[400px] object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <span className="inline-block px-3 py-1 bg-secondary-lime text-primary-navy font-bold text-[10px] uppercase rounded mb-3">
                  Destacado
                </span>
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-2 leading-tight">
                  {featuredNews.title}
                </h2>
                <p className="text-gray-200 text-sm md:text-base line-clamp-2 mb-4 max-w-3xl">
                  {featuredNews.excerpt}
                </p>
                <button className="inline-flex items-center gap-2 text-secondary-lime font-bold text-sm uppercase tracking-wider hover:underline">
                  Leer más
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </section>
        )}

        {/* News Grid */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-primary-navy">Últimas Noticias</h3>
            <span className="text-xs text-gray-400 font-medium">
              Mostrando {regularNews.length} resultados
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {regularNews.map((item) => (
              <article
                key={item.id}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group"
              >
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="p-4 flex flex-col flex-grow">
                  <span className="text-[10px] font-bold text-secondary-lime uppercase tracking-wider mb-2">
                    {item.category.replace('-', ' ')}
                  </span>
                  <h4 className="font-bold text-primary-navy text-lg mb-2 leading-snug group-hover:text-secondary-lime transition-colors">
                    {item.title}
                  </h4>
                  <p className="text-sm text-gray-500 line-clamp-3 mb-4 flex-grow">
                    {item.excerpt}
                  </p>
                  <div className="mt-auto pt-4 border-t border-gray-100 flex justify-between items-center">
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <Clock size={12} />
                      <span>{item.date}</span>
                    </div>
                    <button className="text-sm font-bold text-primary-navy hover:text-secondary-lime transition-colors flex items-center gap-1">
                      Leer más
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Load More */}
        <div className="mt-8 flex justify-center">
          <button className="px-8 py-3 bg-white border border-gray-200 text-primary-navy font-bold rounded-xl shadow-sm hover:bg-gray-50 transition-colors">
            Cargar más noticias
          </button>
        </div>
      </main>
    </div>
  );
};

export default News;
