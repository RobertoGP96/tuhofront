import React from 'react';
import { Link } from 'react-router-dom';
import { Network, FileText, CloudUpload, ChevronRight, BookOpen, Building2, Newspaper } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const Home: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <section className="flex flex-col gap-0 items-center pb-20 grow w-full bg-white -mt-6 md:-mt-8 -mx-6 md:-mx-8 w-[calc(100%+3rem)] md:w-[calc(100%+4rem)]">
      {/* Hero Section */}
      <article className="relative w-full flex flex-col justify-center items-center h-[400px] overflow-hidden bg-primary-navy">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.uho.edu.cu/wp-content/uploads/2019/07/uho-bg.jpg')] bg-cover bg-center"></div>
        <div className="relative w-full max-w-4xl flex flex-col gap-6 items-center justify-center z-10 p-8 text-center">
          <img
            src="/img/logo/svg/IdUHo-01.svg"
            className="w-[280px] md:w-[350px] brightness-0 invert"
            alt="Logo Universidad de Holguín"
            onError={(e) => (e.currentTarget.src = 'https://www.uho.edu.cu/wp-content/uploads/2019/07/logo-uho.png')}
          />
          <div className="h-1 w-24 bg-secondary-lime rounded-full"></div>
        </div>
      </article>

      {/* Content Section */}
      <article className="py-16 w-full max-w-6xl px-4 md:px-8">
        <div className="flex flex-col items-center mb-16">
          <h1 className="text-primary-navy text-center uppercase font-black text-2xl md:text-3xl lg:text-4xl mb-8 max-w-3xl leading-tight">
            Plataforma de Trámites de la <span className="text-secondary-lime">Universidad de Holguín</span>
          </h1>
          
          <div className="max-w-3xl text-center space-y-4 text-gray-600 leading-relaxed">
            <p>
              La plataforma de trámites y servicios de la Universidad de Holguín es una
              herramienta virtual que tiene como objetivo principal brindar una experiencia ágil y eficiente
              a los estudiantes, docentes y personal administrativo de la institución.
            </p>
            <p>
              Su implementación busca optimizar los procesos internos
              y mejorar la comunicación entre los diferentes actores involucrados en la vida universitaria,
              diseñado para facilitar la gestión administrativa y académica.
            </p>
          </div>
        </div>

        {/* Features List */}
        <ul className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
          {/* Feature 1 */}
          <li className="group p-8 bg-white border border-gray-100 rounded-3xl flex flex-col items-center text-center gap-6 cursor-pointer hover:border-secondary-lime/50 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500">
            <div className="w-20 h-20 border-2 border-primary-navy rounded-2xl p-4 flex justify-center items-center bg-primary-navy text-white group-hover:bg-secondary-lime group-hover:border-secondary-lime transition-all duration-500 shadow-lg group-hover:shadow-secondary-lime/40">
              <Network size={40} />
            </div>
            <div className="space-y-3">
              <h5 className="uppercase text-primary-navy font-bold text-base tracking-wider group-hover:text-secondary-lime transition-colors">
                Sistema en línea
              </h5>
              <p className="text-sm text-gray-500 font-light leading-relaxed">
                Facilita la gestión administrativa y académica de la comunidad
                universitaria, optimizando la comunicación interna.
              </p>
            </div>
            <div className="mt-auto pt-4 text-secondary-lime opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-500">
              <ChevronRight size={24} />
            </div>
          </li>

          {/* Feature 2 */}
          <li className="group p-8 bg-white border border-gray-100 rounded-3xl flex flex-col items-center text-center gap-6 cursor-pointer hover:border-secondary-lime/50 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500">
            <div className="w-20 h-20 border-2 border-primary-navy rounded-2xl p-4 flex justify-center items-center bg-primary-navy text-white group-hover:bg-secondary-lime group-hover:border-secondary-lime transition-all duration-500 shadow-lg group-hover:shadow-secondary-lime/40">
              <FileText size={40} />
            </div>
            <div className="space-y-3">
              <h5 className="uppercase text-primary-navy font-bold text-base tracking-wider group-hover:text-secondary-lime transition-colors">
                Trámites Administrativos
              </h5>
              <p className="text-sm text-gray-500 font-light leading-relaxed">
                Agiliza procesos relacionados con inscripción, matrícula y solicitud de documentos académicos oficiales.
              </p>
            </div>
            <div className="mt-auto pt-4 text-secondary-lime opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-500">
              <ChevronRight size={24} />
            </div>
          </li>

          {/* Feature 3 */}
          <li className="group p-8 bg-white border border-gray-100 rounded-3xl flex flex-col items-center text-center gap-6 cursor-pointer hover:border-secondary-lime/50 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500">
            <div className="w-20 h-20 border-2 border-primary-navy rounded-2xl p-4 flex justify-center items-center bg-primary-navy text-white group-hover:bg-secondary-lime group-hover:border-secondary-lime transition-all duration-500 shadow-lg group-hover:shadow-secondary-lime/40">
              <CloudUpload size={40} />
            </div>
            <div className="space-y-3">
              <h5 className="uppercase text-primary-navy font-bold text-base tracking-wider group-hover:text-secondary-lime transition-colors">
                Digitalización
              </h5>
              <p className="text-sm text-gray-500 font-light leading-relaxed">
                Promovemos una experiencia moderna y cómoda garantizando eficiencia en todos los servicios universitarios.
              </p>
            </div>
            <div className="mt-auto pt-4 text-secondary-lime opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-500">
              <ChevronRight size={24} />
            </div>
          </li>
        </ul>
      </article>

      {isAuthenticated && (
        <article className="py-12 w-full bg-primary-navy/5">
          <div className="max-w-6xl mx-auto px-4 md:px-8">
            <h2 className="text-center text-xl font-black text-primary-navy uppercase tracking-wide mb-8">
              Acceso <span className="text-secondary-lime">Rápido</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Link
                to="/procedures"
                className="group flex items-center gap-4 p-5 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-secondary-lime/40 transition-all"
              >
                <div className="p-3 bg-primary-navy/5 rounded-xl group-hover:bg-secondary-lime/20 transition-colors">
                  <BookOpen size={22} className="text-primary-navy" />
                </div>
                <div>
                  <p className="font-bold text-primary-navy text-sm">Mis Trámites</p>
                  <p className="text-xs text-gray-400">Ver y gestionar solicitudes</p>
                </div>
              </Link>
              <Link
                to="/locals"
                className="group flex items-center gap-4 p-5 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-secondary-lime/40 transition-all"
              >
                <div className="p-3 bg-primary-navy/5 rounded-xl group-hover:bg-secondary-lime/20 transition-colors">
                  <Building2 size={22} className="text-primary-navy" />
                </div>
                <div>
                  <p className="font-bold text-primary-navy text-sm">Reservar Local</p>
                  <p className="text-xs text-gray-400">Aulas, laboratorios y espacios</p>
                </div>
              </Link>
              <Link
                to="/news"
                className="group flex items-center gap-4 p-5 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-secondary-lime/40 transition-all"
              >
                <div className="p-3 bg-primary-navy/5 rounded-xl group-hover:bg-secondary-lime/20 transition-colors">
                  <Newspaper size={22} className="text-primary-navy" />
                </div>
                <div>
                  <p className="font-bold text-primary-navy text-sm">Noticias</p>
                  <p className="text-xs text-gray-400">Anuncios y publicaciones</p>
                </div>
              </Link>
            </div>
          </div>
        </article>
      )}
    </section>
  );
};

export default Home;
