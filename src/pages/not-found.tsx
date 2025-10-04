import React from 'react';
import { Link } from 'react-router-dom';
import routes from '../routes/paths';

const NotFound: React.FC = () => {
  return (
    <section className="flex items-center justify-center min-h-[70vh] p-8">
      <div className="max-w-md mx-auto text-center bg-white p-8 rounded-lg shadow-lg">
        <div style={{ textAlign: 'center' }}>
          <svg width="160" height="160" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
            <circle cx="12" cy="12" r="10" fill="#F3F6FB" />
            <path d="M9.5 9.5L14.5 14.5" stroke="#007BFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M14.5 9.5L9.5 14.5" stroke="#007BFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>

          <h1 className="text-3xl font-bold text-gray-800 mb-4">404 — Página no encontrada</h1>
          <p className="text-gray-600 mb-6">Lo sentimos, no hemos podido encontrar la página que buscas.</p>

          <div style={{ maxWidth: 480, margin: '18px auto' }}>
            <p className="text-blue-600 text-center">
              Puede que la ruta esté mal escrita o que la página haya sido movida.
            </p>
          </div>

          <div className="flex gap-3 justify-center mt-4">
            <Link to={routes.home}>
              <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
                Ir al inicio
              </button>
            </Link>
            <Link to={routes.support}>
              <button className="border border-blue-600 text-blue-600 px-6 py-3 rounded-lg hover:bg-blue-50 transition-colors">
                Contactar soporte
              </button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NotFound;
