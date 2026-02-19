import React from 'react';
import { UhoContactInfo } from './UhoContactInfo';
import { Social } from './Social';
import { Logo } from './Logo';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-primary-navy text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {/* Logo y Descripción */}
          <div className="flex flex-col gap-4">
            <div className="w-fit">
              <Logo />
            </div>
            <p className="text-sm text-gray-300 leading-relaxed max-w-sm">
              Universidad de Holguín "Oscar Lucero Moya". 
              Comprometidos con la excelencia académica y el desarrollo integral de nuestra comunidad.
            </p>
          </div>

          {/* Información de Contacto */}
          <div className="flex flex-col gap-4">
            <UhoContactInfo />
          </div>

          {/* Redes Sociales */}
          <div className="flex flex-col gap-4">
            <Social />
          </div>
        </div>

        {/* Barra inferior */}
        <div className="mt-12 pt-8 border-t border-gray-700 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-400">
            © {currentYear} Universidad de Holguín. Todos los derechos reservados.
          </p>
          <div className="flex items-center gap-6 text-sm">
            <a 
              href="#" 
              className="text-gray-400 hover:text-white transition-colors"
            >
              Política de Privacidad
            </a>
            <a 
              href="#" 
              className="text-gray-400 hover:text-white transition-colors"
            >
              Términos de Uso
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
