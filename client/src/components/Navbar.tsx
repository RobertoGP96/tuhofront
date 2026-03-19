import {
  ChevronDown,
  FileText,
  Home,
  LogIn,
  LogOut,
  MessageSquare,
  Newspaper,
  Search,
  Settings,
  Shield,
  User
} from 'lucide-react';
import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { cn } from '../utils';
import { Logo } from './Logo';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

interface ProcedureItem {
  label: string;
  icon?: string;
  items?: ProcedureItem[];
  command?: () => void;
}

import { useAuth } from '../hooks/useAuth';

interface NavbarProps {
  role?: 'user' | 'admin';
}

export const Navbar: React.FC<NavbarProps> = ({ role: propsRole }) => {
  const navigate = useNavigate();
  const { user, isAdmin, logout, isAuthenticated } = useAuth();
  const role = propsRole || (isAdmin ? 'ADMIN' : 'USUARIO');
  const userName = user?.username || user?.email || 'Invitado';

  const proceduresMenuItems = [
    {
      label: "Internos",
      icon: "bx bx-plus bx-sm",
      items: [
        { 
          label: "Alimentacion", 
          icon: "bx bx-restaurant bx-sm",
          command: () => { 
            navigate("/procedures/internal/feeding");
          }
        },
        { 
          label: "Hospedaje", 
          icon: "bx bxs-hotel bx-sm",
          command: () => { 
            navigate("/procedures/internal/accommodation");
          }
        },
        { 
          label: "Transporte", 
          icon: "bx bxs-bus bx-sm",
          command: () => { 
            navigate("/procedures/internal/transport");
          }
        },
        { 
          label: "Mantenimiento", 
          icon: "bx bxs-wrench bx-sm",
          command: () => { 
            navigate("/procedures/internal/maintenance");
          }
        },
      ],
    },
    {
      label: "Secretaría Docente",
      icon: "bx bx-book bx-sm",
      items: [
        {
          label: "Pregrado",
          icon: "bx bxs-graduation bx-sm",
          items: [
            { 
              label: "Nacional", 
              icon: "bx bx-globe bx-sm", 
              command: () => { 
                navigate("/procedures/secretary/undergraduate/national");
              } 
            },
            { 
              label: "Internacional", 
              icon: "bx bx-send bx-sm", 
              command: () => { 
                navigate("/procedures/secretary/undergraduate/international");
              } 
            }
          ]
        },
        {
          label: "Postgrado",
          icon: "bx bx-briefcase bx-sm",
          items: [
            { 
              label: "Nacional", 
              icon: "bx bx-globe bx-sm", 
              command: () => { 
                navigate("/procedures/secretary/postgraduate/national");
              } 
            },
            { 
              label: "Internacional", 
              icon: "bx bx-send bx-sm", 
              command: () => { 
                navigate("/procedures/secretary/postgraduate/international");
              } 
            }
          ]
        },
        {
          label: "Legalización de Título",
          icon: "bx bxs-certification bx-sm",
          command: () => { 
              navigate("/procedures/secretary/title-legalization");
            }
        }
      ],
    },
    {
      label: "Locales",
      icon: "bx bx-desktop bx-sm",
      items: [
        {
          label: "Todos los Locales",
          icon: "bx bx-building bx-sm",
          command: () => { navigate("/locals"); }
        },
        {
          label: "Aulas Especializadas",
          icon: "bx bx-building bx-sm",
          command: () => { navigate("/locals?type=AULA"); }
        },
        {
          label: "Laboratorios",
          icon: "bx bxs-flask bx-sm",
          command: () => { navigate("/locals?type=LABORATORIO"); }
        },
        ...(isAuthenticated ? [{
          label: "Mis Reservas",
          icon: "bx bx-calendar bx-sm",
          command: () => { navigate("/locals/my-reservations"); }
        }] : []),
      ],
    },
  ];

  const userMenuItems = [
    { label: 'Inicio', icon: Home, to: '/' },
    { label: 'Noticias', icon: Newspaper, to: '/news' },
    { label: 'Contáctenos', icon: MessageSquare, to: '/contact' },
  ];

  const renderProceduresItems = (items: ProcedureItem[]) => {
    return items.map((item, index) => {
      if (item.items) {
        return (
          <DropdownMenuSub key={index}>
            <DropdownMenuSubTrigger className="gap-2 cursor-pointer">
              {item.icon && <i className={cn(item.icon, "text-lg text-gray-400")} />}
              <span>{item.label}</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="min-w-50">
              {renderProceduresItems(item.items)}
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        );
      }

      return (
        <DropdownMenuItem
          key={index}
          className="gap-2 cursor-pointer"
          onClick={item.command}
        >
          {item.icon && <i className={cn(item.icon, "text-lg text-gray-400")} />}
          <span>{item.label}</span>
        </DropdownMenuItem>
      );
    });
  };

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
          
          {/* Trámites Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="gap-2 text-gray-500 hover:text-primary-navy hover:bg-gray-50 cursor-pointer"
              >
                <FileText size={18} />
                Trámites
                <ChevronDown size={14} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="min-w-50">
              {renderProceduresItems(proceduresMenuItems)}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="text-gray-400 hover:text-primary-navy">
          <Search size={20} />
        </Button>

        {isAuthenticated ? (
          <div className="relative">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div
                  
                  className="flex items-center gap-2 pl-2 pr-1 py-2 rounded-full border border-gray-100 hover:bg-gray-50 cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-primary-navy">
                    <User size={18} />
                  </div>
                  <span className="hidden sm:inline text-xs font-medium text-gray-600 truncate max-w-30">
                    {userName}
                  </span>
                  <ChevronDown size={14} className="text-gray-400" />
                </div>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-48">
                <div className="px-4 py-2 border-b border-gray-50 md:hidden">
                  <p className="text-xs font-semibold text-primary-navy truncate">{userName}</p>
                  <p className="text-[10px] text-gray-400 capitalize">{role}</p>
                </div>
                <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => navigate('/profile')}>
                  <User size={16} /> Perfil
                </DropdownMenuItem>
                {role === 'ADMIN' && (
                  <>
                    <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => navigate('/admin/dashboard')}>
                      <Shield size={16} /> Administración
                    </DropdownMenuItem>
                    <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => navigate('/admin/settings')}>
                      <Settings size={16} /> Configuración
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="gap-2 cursor-pointer text-red-500 focus:text-red-600 focus:bg-red-50"
                  onClick={() => {
                    logout();
                    navigate('/');
                  }}
                >
                  <LogOut size={16} /> Cerrar Sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : (
          <Button 
            size="sm" 
            className="rounded-full bg-primary-navy hover:bg-primary-navy/90 text-white px-6 font-bold uppercase text-[10px] tracking-widest shadow-lg shadow-primary-navy/20 hover:shadow-primary-navy/30 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 flex items-center gap-2 border border-primary-navy"
            onClick={() => navigate('/login')}
          >
            <LogIn size={14} className="text-secondary-lime" />
            Acceder
          </Button>
        )}
      </div>
    </nav>
  );
};
