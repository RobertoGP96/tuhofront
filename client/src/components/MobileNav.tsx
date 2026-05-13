import React from 'react';
import {
  BookOpen,
  Building2,
  ClipboardList,
  FileBarChart,
  FileText,
  Home,
  LogIn,
  MessageSquare,
  Newspaper,
  Shield,
  User,
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { cn } from '../utils';

function MobileNavItem({
  label,
  icon: Icon,
  to,
  end,
}: {
  label: string;
  icon: React.ElementType;
  to: string;
  end?: boolean;
}) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        cn(
          'flex flex-col items-center justify-center gap-1 p-2 transition-colors',
          isActive ? 'text-secondary-lime' : 'text-gray-400 hover:text-primary-navy',
        )
      }
    >
      <Icon size={24} />
      <span className="text-[10px] font-medium">{label}</span>
    </NavLink>
  );
}

export const MobileNav: React.FC = () => {
  const {
    isAuthenticated,
    isAdmin,
    isGestorInterno,
    isGestorTramites,
    isGestorReservas,
    canManageSecretary,
  } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-gray-100 flex items-center justify-around px-2 z-50">
        <MobileNavItem label="Inicio" icon={Home} to="/" end />
        <MobileNavItem label="Noticias" icon={Newspaper} to="/news" />
        <MobileNavItem label="Contacto" icon={MessageSquare} to="/contact" />
        <MobileNavItem label="Acceder" icon={LogIn} to="/login" />
      </div>
    );
  }

  if (isAdmin) {
    return (
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-gray-100 flex items-center justify-around px-2 z-50">
        <MobileNavItem label="Inicio" icon={Home} to="/" end />
        <MobileNavItem label="Admin" icon={Shield} to="/admin" />
        <MobileNavItem label="Secretaría" icon={BookOpen} to="/secretary" />
        <MobileNavItem label="Trámites" icon={FileText} to="/procedures" />
        <MobileNavItem label="Perfil" icon={User} to="/profile" />
      </div>
    );
  }

  if (isGestorInterno) {
    return (
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-gray-100 flex items-center justify-around px-2 z-50">
        <MobileNavItem label="Inicio" icon={Home} to="/" end />
        <MobileNavItem label="Internos" icon={ClipboardList} to="/gestor-interno" />
        <MobileNavItem label="Reportes" icon={FileBarChart} to="/reports" />
        <MobileNavItem label="Perfil" icon={User} to="/profile" />
      </div>
    );
  }

  if (isGestorTramites) {
    return (
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-gray-100 flex items-center justify-around px-2 z-50">
        <MobileNavItem label="Inicio" icon={Home} to="/" end />
        <MobileNavItem label="Trámites" icon={FileText} to="/gestor-tramites" />
        <MobileNavItem label="Reportes" icon={FileBarChart} to="/reports" />
        <MobileNavItem label="Perfil" icon={User} to="/profile" />
      </div>
    );
  }

  if (isGestorReservas) {
    return (
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-gray-100 flex items-center justify-around px-2 z-50">
        <MobileNavItem label="Inicio" icon={Home} to="/" end />
        <MobileNavItem label="Reservas" icon={Building2} to="/gestor-reservas" />
        <MobileNavItem label="Reportes" icon={FileBarChart} to="/reports" />
        <MobileNavItem label="Perfil" icon={User} to="/profile" />
      </div>
    );
  }

  if (canManageSecretary) {
    return (
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-gray-100 flex items-center justify-around px-2 z-50">
        <MobileNavItem label="Inicio" icon={Home} to="/" end />
        <MobileNavItem label="Trámites" icon={FileText} to="/procedures" />
        <MobileNavItem label="Secretaría" icon={BookOpen} to="/secretary" />
        <MobileNavItem label="Perfil" icon={User} to="/profile" />
      </div>
    );
  }

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-gray-100 flex items-center justify-around px-2 z-50">
      <MobileNavItem label="Inicio" icon={Home} to="/" end />
      <MobileNavItem label="Noticias" icon={Newspaper} to="/news" />
      <MobileNavItem label="Trámites" icon={FileText} to="/procedures" />
      <MobileNavItem label="Perfil" icon={User} to="/profile" />
    </div>
  );
};
