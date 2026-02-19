import React from 'react';
import { Home, Newspaper, FileText, User } from 'lucide-react';
import { NavItem } from './NavItem';

export const MobileNav: React.FC = () => {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-gray-100 flex items-center justify-around px-2 z-50">
      <NavItem label="Inicio" icon={Home} to="/" variant="bottom" />
      <NavItem label="Noticias" icon={Newspaper} to="/news" variant="bottom" />
      <NavItem label="Trámites" icon={FileText} to="/procedures" variant="bottom" />
      <NavItem label="Perfil" icon={User} to="/profile" variant="bottom" />
    </div>
  );
};
