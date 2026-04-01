import {
  Bell,
  BookOpen,
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
  User,
  Wrench,
} from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { notificationsService } from '../services/notifications.service';
import type { Notificacion } from '../types/notifications.types';
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

interface NavbarProps {
  role?: 'user' | 'admin';
}

export const Navbar: React.FC<NavbarProps> = () => {
  const navigate = useNavigate();
  const {
    user,
    isAdmin,
    isSecretaria,
    canAccessInternal,
    canManageSecretary,
    logout,
    isAuthenticated,
  } = useAuth();
  const userName = user?.username || user?.email || 'Invitado';
  const userRole = user?.user_type ?? '';

  // ── Notifications ──────────────────────────────────────────────────────────
  const [unreadCount, setUnreadCount] = useState(0);
  const [recentNotifications, setRecentNotifications] = useState<Notificacion[]>([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isAuthenticated) return;

    async function fetchNotifStats() {
      try {
        const [stats, unread] = await Promise.all([
          notificationsService.getStats(),
          notificationsService.getUnread(),
        ]);
        setUnreadCount(stats.sin_leer);
        setRecentNotifications(unread.slice(0, 5));
      } catch {
        // silently ignore
      }
    }

    fetchNotifStats();
    const interval = setInterval(fetchNotifStats, 60_000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ── Role label ──────────────────────────────────────────────────────────────
  const ROLE_LABELS: Record<string, string> = {
    ADMIN: 'Administrador',
    SECRETARIA_DOCENTE: 'Secretaría Docente',
    PROFESOR: 'Profesor',
    TRABAJADOR: 'Trabajador',
    ESTUDIANTE: 'Estudiante',
    EXTERNO: 'Externo',
  };

  // ── Static nav links (always visible) ──────────────────────────────────────
  const publicLinks = [
    { label: 'Inicio', icon: Home, to: '/' },
    { label: 'Noticias', icon: Newspaper, to: '/news' },
    { label: 'Contacto', icon: MessageSquare, to: '/contact' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-100 px-4 md:px-8 flex items-center justify-between z-50">
      {/* ── Left: Logo + Desktop Nav ── */}
      <div className="flex items-center gap-6">
        <Link to="/">
          <Logo />
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {/* Public links */}
          {publicLinks.map((item) => (
            <NavLink
              key={item.label}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                cn(
                  'px-3 py-2 text-sm font-medium transition-colors rounded-md flex items-center gap-2',
                  isActive
                    ? 'text-primary-navy bg-accent'
                    : 'text-gray-500 hover:text-primary-navy hover:bg-gray-50',
                )
              }
            >
              <item.icon size={16} className="opacity-70" />
              {item.label}
            </NavLink>
          ))}

          {/* Trámites dropdown — authenticated users only */}
          {isAuthenticated && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2 text-gray-500 hover:text-primary-navy hover:bg-gray-50 cursor-pointer"
                >
                  <FileText size={16} className="opacity-70" />
                  Trámites
                  <ChevronDown size={13} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="min-w-52">
                {/* My Procedures */}
                <DropdownMenuItem
                  className="gap-2 cursor-pointer"
                  onClick={() => navigate('/procedures')}
                >
                  <BookOpen size={15} className="text-gray-400" />
                  Mis Trámites
                </DropdownMenuItem>

                {/* Mis Trámites Internos — PROFESOR, TRABAJADOR, ADMIN */}
                {canAccessInternal && (
                  <DropdownMenuItem
                    className="gap-2 cursor-pointer"
                    onClick={() => navigate('/procedures/internals')}
                  >
                    <Wrench size={15} className="text-gray-400" />
                    Mis Trámites Internos
                  </DropdownMenuItem>
                )}

                <DropdownMenuSeparator />

                {/* Secretaría Docente — all authenticated */}
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger className="gap-2 cursor-pointer">
                    <i className="bx bx-book text-base text-gray-400" />
                    Secretaría Docente
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent className="min-w-48">
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger className="gap-2 cursor-pointer">
                        <i className="bx bxs-graduation text-base text-gray-400" />
                        Pregrado
                      </DropdownMenuSubTrigger>
                      <DropdownMenuSubContent>
                        <DropdownMenuItem
                          className="gap-2 cursor-pointer"
                          onClick={() => navigate('/procedures/secretary/undergraduate/national')}
                        >
                          Nacional
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="gap-2 cursor-pointer"
                          onClick={() => navigate('/procedures/secretary/undergraduate/international')}
                        >
                          Internacional
                        </DropdownMenuItem>
                      </DropdownMenuSubContent>
                    </DropdownMenuSub>
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger className="gap-2 cursor-pointer">
                        <i className="bx bx-briefcase text-base text-gray-400" />
                        Posgrado
                      </DropdownMenuSubTrigger>
                      <DropdownMenuSubContent>
                        <DropdownMenuItem
                          className="gap-2 cursor-pointer"
                          onClick={() => navigate('/procedures/secretary/postgraduate/national')}
                        >
                          Nacional
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="gap-2 cursor-pointer"
                          onClick={() => navigate('/procedures/secretary/postgraduate/international')}
                        >
                          Internacional
                        </DropdownMenuItem>
                      </DropdownMenuSubContent>
                    </DropdownMenuSub>
                    <DropdownMenuItem
                      className="gap-2 cursor-pointer"
                      onClick={() => navigate('/procedures/secretary/title-legalization')}
                    >
                      <i className="bx bxs-certification text-base text-gray-400" />
                      Legalización de Título
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>

                {/* Internos — ADMIN, PROFESOR, TRABAJADOR only */}
                {canAccessInternal && (
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger className="gap-2 cursor-pointer">
                      <i className="bx bx-plus text-base text-gray-400" />
                      Trámites Internos
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent className="min-w-44">
                      <DropdownMenuItem
                        className="gap-2 cursor-pointer"
                        onClick={() => navigate('/procedures/internal/feeding')}
                      >
                        <i className="bx bx-restaurant text-base text-gray-400" />
                        Alimentación
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="gap-2 cursor-pointer"
                        onClick={() => navigate('/procedures/internal/accommodation')}
                      >
                        <i className="bx bxs-hotel text-base text-gray-400" />
                        Hospedaje
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="gap-2 cursor-pointer"
                        onClick={() => navigate('/procedures/internal/transport')}
                      >
                        <i className="bx bxs-bus text-base text-gray-400" />
                        Transporte
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="gap-2 cursor-pointer"
                        onClick={() => navigate('/procedures/internal/maintenance')}
                      >
                        <i className="bx bxs-wrench text-base text-gray-400" />
                        Mantenimiento
                      </DropdownMenuItem>
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                )}

                <DropdownMenuSeparator />

                {/* Locales — all */}
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger className="gap-2 cursor-pointer">
                    <i className="bx bx-building text-base text-gray-400" />
                    Locales
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent className="min-w-44">
                    <DropdownMenuItem
                      className="gap-2 cursor-pointer"
                      onClick={() => navigate('/locals')}
                    >
                      Todos los Locales
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="gap-2 cursor-pointer"
                      onClick={() => navigate('/locals/my-reservations')}
                    >
                      Mis Reservas
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Secretary panel link — SECRETARIA_DOCENTE + ADMIN */}
          {canManageSecretary && !isAdmin && (
            <NavLink
              to="/secretary"
              className={({ isActive }) =>
                cn(
                  'px-3 py-2 text-sm font-medium transition-colors rounded-md flex items-center gap-2',
                  isActive
                    ? 'text-primary-navy bg-accent'
                    : 'text-gray-500 hover:text-primary-navy hover:bg-gray-50',
                )
              }
            >
              <BookOpen size={16} className="opacity-70" />
              Secretaría
            </NavLink>
          )}

          {/* Admin panel link — ADMIN only */}
          {isAdmin && (
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                cn(
                  'px-3 py-2 text-sm font-medium transition-colors rounded-md flex items-center gap-2',
                  isActive
                    ? 'text-primary-navy bg-accent'
                    : 'text-gray-500 hover:text-primary-navy hover:bg-gray-50',
                )
              }
            >
              <Shield size={16} className="opacity-70" />
              Administración
            </NavLink>
          )}
        </div>
      </div>

      {/* ── Right: Search + Bell + User ── */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="text-gray-400 hover:text-primary-navy">
          <Search size={20} />
        </Button>

        {/* Notification Bell — authenticated only */}
        {isAuthenticated && (
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setNotifOpen((prev) => !prev)}
              className="relative p-2 text-gray-400 hover:text-primary-navy transition-colors rounded-lg hover:bg-gray-50"
              aria-label="Notificaciones"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-red-500 text-[9px] text-white flex items-center justify-center font-bold leading-none">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {notifOpen && (
              <div className="absolute right-0 top-11 w-80 bg-white border border-gray-100 rounded-xl shadow-xl z-50">
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                  <span className="font-semibold text-primary-navy text-sm">Notificaciones</span>
                  <Link
                    to="/notifications"
                    onClick={() => setNotifOpen(false)}
                    className="text-xs text-blue-600 hover:underline"
                  >
                    Ver todas
                  </Link>
                </div>

                {recentNotifications.length === 0 ? (
                  <div className="px-4 py-6 text-center text-sm text-gray-400">
                    Sin notificaciones nuevas
                  </div>
                ) : (
                  <ul className="divide-y divide-gray-50 max-h-72 overflow-y-auto">
                    {recentNotifications.map((n) => (
                      <li
                        key={n.id}
                        className={cn(
                          'px-4 py-3 hover:bg-gray-50 cursor-pointer flex gap-3',
                          !n.visto && 'bg-blue-50/40',
                        )}
                        onClick={() => {
                          notificationsService.markAsRead(n.id).catch(() => {});
                          setUnreadCount((c) => Math.max(0, c - 1));
                          setNotifOpen(false);
                          if (n.url_accion) navigate(n.url_accion);
                        }}
                      >
                        {!n.visto && (
                          <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-blue-500" />
                        )}
                        <div className={cn('flex-1 min-w-0', n.visto && 'pl-4')}>
                          <p className="text-sm font-medium text-gray-800 truncate">{n.asunto}</p>
                          <p className="text-xs text-gray-400">{n.tiempo_transcurrido}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}

                <div className="px-4 py-2 border-t border-gray-100">
                  <Link
                    to="/notifications"
                    onClick={() => setNotifOpen(false)}
                    className="block text-center text-xs text-blue-600 hover:underline py-1"
                  >
                    Ver centro de notificaciones
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}

        {/* User menu / Login button */}
        {isAuthenticated ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex items-center gap-2 pl-2 pr-1 py-1.5 rounded-full border border-gray-100 hover:bg-gray-50 cursor-pointer">
                <div className="w-7 h-7 rounded-full bg-accent flex items-center justify-center text-primary-navy">
                  <User size={16} />
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-semibold text-gray-700 truncate max-w-28 leading-none">
                    {userName}
                  </p>
                  <p className="text-[10px] text-gray-400 leading-none mt-0.5">
                    {ROLE_LABELS[userRole] ?? userRole}
                  </p>
                </div>
                <ChevronDown size={13} className="text-gray-400 mr-1" />
              </div>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-52">
              {/* Mobile-only role header */}
              <div className="px-3 py-2 border-b border-gray-50 sm:hidden">
                <p className="text-xs font-semibold text-primary-navy truncate">{userName}</p>
                <p className="text-[10px] text-gray-400">{ROLE_LABELS[userRole] ?? userRole}</p>
              </div>

              <DropdownMenuItem
                className="gap-2 cursor-pointer"
                onClick={() => navigate('/profile')}
              >
                <User size={15} /> Perfil
              </DropdownMenuItem>

              <DropdownMenuItem
                className="gap-2 cursor-pointer"
                onClick={() => navigate('/procedures')}
              >
                <BookOpen size={15} /> Mis Trámites
              </DropdownMenuItem>

              {/* Secretary panel — SECRETARIA_DOCENTE + ADMIN */}
              {canManageSecretary && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="gap-2 cursor-pointer"
                    onClick={() => navigate('/secretary')}
                  >
                    <FileText size={15} /> Panel Secretaría
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="gap-2 cursor-pointer"
                    onClick={() => navigate('/secretary/procedures')}
                  >
                    <FileText size={15} className="opacity-0" /> Gestionar Trámites
                  </DropdownMenuItem>
                </>
              )}

              {/* Admin panel — ADMIN only */}
              {isAdmin && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="gap-2 cursor-pointer"
                    onClick={() => navigate('/admin')}
                  >
                    <Shield size={15} /> Panel Admin
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="gap-2 cursor-pointer"
                    onClick={() => navigate('/admin/users')}
                  >
                    <User size={15} /> Usuarios
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="gap-2 cursor-pointer"
                    onClick={() => navigate('/admin/settings')}
                  >
                    <Settings size={15} /> Configuración
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
                <LogOut size={15} /> Cerrar Sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button
            size="sm"
            className="rounded-full bg-primary-navy hover:bg-primary-navy/90 text-white px-6 font-bold uppercase text-[10px] tracking-widest shadow-lg shadow-primary-navy/20 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 flex items-center gap-2"
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
