import React, { useState } from 'react';
import { 
  Home, 
  Newspaper, 
  FileText, 
  MessageSquare, 
  Search, 
  User, 
  ChevronDown,
  Settings,
  LayoutDashboard,
  LogOut
} from 'lucide-react';
import { NavLink, Link } from 'react-router-dom';
import { Logo } from './Logo';
import { cn } from '../utils';

interface NavbarProps {
  role?: 'user' | 'admin';
  userName?: string;
}

export const Navbar: React.FC<NavbarProps> = ({ role = 'user', userName = 'admin@example.com' }) => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const userMenuItems = [
    { label: 'Inicio', icon: Home, to: '/' },
    { label: 'Noticias', icon: Newspaper, to: '/news' },
    { label: 'Trámites', icon: FileText, to: '/procedures' },
    { label: 'Contáctenos', icon: MessageSquare, to: '/contact' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-100 px-4 md:px-8 flex items-center justify-between z-50">
      <div className="flex items-center gap-8">
        <Link to="/">
          <Logo />
        </Link>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-1">
          {userMenuItems.map((item) => (
            <NavLink
              key={item.label}
              to={item.to}
              className={({ isActive }) => cn(
                "px-3 py-2 text-sm font-medium transition-colors rounded-md flex items-center gap-2",
                isActive 
                  ? "text-primary-navy bg-accent" 
                  : "text-gray-500 hover:text-primary-navy hover:bg-gray-50"
              )}
            >
              <item.icon size={18} className={cn("transition-colors", "text-gray-400 group-hover:text-primary-navy")} />
              {item.label}
            </NavLink>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="p-2 text-gray-400 hover:text-primary-navy transition-colors">
          <Search size={20} />
        </button>

        <div className="relative">
          <button 
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-full border border-gray-100 hover:bg-gray-50 transition-all"
          >
            <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-primary-navy">
              <User size={18} />
            </div>
            <span className="hidden sm:inline text-xs font-medium text-gray-600 truncate max-w-[120px]">
              {userName}
            </span>
            <ChevronDown size={14} className={cn("text-gray-400 transition-transform", isUserMenuOpen && "rotate-180")} />
          </button>

          {isUserMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-lg shadow-lg py-1 z-[60]">
              <div className="px-4 py-2 border-b border-gray-50 md:hidden">
                <p className="text-xs font-semibold text-primary-navy truncate">{userName}</p>
                <p className="text-[10px] text-gray-400 capitalize">{role}</p>
              </div>
              <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                <User size={16} /> Perfil
              </button>
              {role === 'admin' && (
                <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                  <Settings size={16} /> Configuración
                </button>
              )}
              <hr className="my-1 border-gray-50" />
              <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors">
                <LogOut size={16} /> Cerrar Sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
