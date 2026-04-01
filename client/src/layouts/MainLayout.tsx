import {
  BookOpen,
  Building2,
  ChevronRight,
  ClipboardList,
  FileCheck,
  Hotel,
  LayoutDashboard,
  Settings,
  Truck,
  Users,
  Utensils,
  Wrench,
} from 'lucide-react';
import React from 'react';
import { useLocation } from 'react-router-dom';
import { Footer } from '../components/Footer';
import { MobileNav } from '../components/MobileNav';
import { Navbar } from '../components/Navbar';
import { NavItem } from '../components/NavItem';
import type { UserRole } from '../types/auth.types';

interface MainLayoutProps {
  children: React.ReactNode;
  role?: UserRole | 'EXTERNO';
}

function SidebarSection({ title }: { title: string }) {
  return (
    <div className="px-3 pt-4 pb-1">
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{title}</p>
    </div>
  );
}

function AdminSidebar() {
  return (
    <>
      <SidebarSection title="Panel Admin" />
      <NavItem label="Dashboard" icon={LayoutDashboard} to="/admin" />
      <NavItem label="Usuarios" icon={Users} to="/admin/users" />
      <NavItem label="Trámites" icon={FileCheck} to="/admin/procedures" />
      <NavItem label="Internos" icon={ClipboardList} to="/admin/internal" />
      <NavItem label="Locales" icon={Building2} to="/admin/locals" />
      <SidebarSection title="Sistema" />
      <NavItem label="Áreas" icon={BookOpen} to="/admin/areas" />
      <NavItem label="Noticias" icon={BookOpen} to="/admin/news" />
      <NavItem label="Configuración" icon={Settings} to="/admin/settings" />
      <div className="mt-auto mx-1 p-3 bg-primary-navy/5 rounded-xl">
        <p className="text-xs text-primary-navy font-semibold mb-1">Estado del Sistema</p>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-secondary-lime animate-pulse" />
          <span className="text-[10px] text-gray-500 font-medium">Operativo</span>
        </div>
      </div>
    </>
  );
}

function SecretarySidebar() {
  return (
    <>
      <SidebarSection title="Secretaría Docente" />
      <NavItem label="Dashboard" icon={LayoutDashboard} to="/secretary" />
      <NavItem label="Trámites" icon={FileCheck} to="/secretary/procedures" />
    </>
  );
}

function GestorInternoSidebar() {
  return (
    <>
      <SidebarSection title="Trámites Internos" />
      <NavItem label="Dashboard" icon={LayoutDashboard} to="/gestor-interno" />
      <NavItem label="Alimentación" icon={Utensils} to="/procedures/internal/feeding" />
      <NavItem label="Alojamiento" icon={Hotel} to="/procedures/internal/accommodation" />
      <NavItem label="Transporte" icon={Truck} to="/procedures/internal/transport" />
      <NavItem label="Mantenimiento" icon={Wrench} to="/procedures/internal/maintenance" />
      <SidebarSection title="Configuración" />
      <NavItem label="Tipos y Prioridades" icon={Settings} to="/gestor-interno/settings" />
    </>
  );
}

function GestorTramitesSidebar() {
  return (
    <>
      <SidebarSection title="Gestión de Trámites" />
      <NavItem label="Dashboard" icon={LayoutDashboard} to="/gestor-tramites" />
      <NavItem label="Todos los Trámites" icon={FileCheck} to="/gestor-tramites" />
      <SidebarSection title="Configuración" />
      <NavItem label="Tipos de Trámites" icon={Settings} to="/gestor-tramites/settings" />
    </>
  );
}

function GestorReservasSidebar() {
  return (
    <>
      <SidebarSection title="Gestión de Reservas" />
      <NavItem label="Dashboard" icon={LayoutDashboard} to="/gestor-reservas" />
      <NavItem label="Locales y Reservas" icon={Building2} to="/gestor-reservas" />
    </>
  );
}

const SIDEBAR_ROLES: UserRole[] = ['ADMIN', 'SECRETARIA_DOCENTE', 'GESTOR_INTERNO', 'GESTOR_TRAMITES', 'GESTOR_RESERVAS'];

const ROLE_LABELS: Partial<Record<UserRole, string>> = {
  ADMIN: 'Admin',
  SECRETARIA_DOCENTE: 'Secretaría',
  GESTOR_INTERNO: 'Gestión Interna',
  GESTOR_TRAMITES: 'Gestión Trámites',
  GESTOR_RESERVAS: 'Gestión Reservas',
};

export const MainLayout: React.FC<MainLayoutProps> = ({ children, role = 'EXTERNO' }) => {
  const hasSidebar = SIDEBAR_ROLES.includes(role as UserRole);
  const location = useLocation();

  const pathLabel = location.pathname
    .split('/')
    .filter(Boolean)
    .map(s => s.charAt(0).toUpperCase() + s.slice(1).replace(/-/g, ' '))
    .join(' › ') || 'Inicio';

  return (
    <div className="min-h-screen bg-white flex flex-col w-full">
      <Navbar role={role === 'ADMIN' ? 'admin' : 'user'} />

      {/* Body: takes all remaining height */}
      <div className="flex flex-1 pt-16 pb-16 md:pb-0 overflow-hidden">

        {/* Sidebar */}
        {hasSidebar && (
          <aside className="hidden md:flex flex-col w-64 shrink-0 border-r border-gray-100 p-3 gap-1 bg-gray-50/40 overflow-y-auto">
            {role === 'ADMIN' && <AdminSidebar />}
            {role === 'SECRETARIA_DOCENTE' && <SecretarySidebar />}
            {role === 'GESTOR_INTERNO' && <GestorInternoSidebar />}
            {role === 'GESTOR_TRAMITES' && <GestorTramitesSidebar />}
            {role === 'GESTOR_RESERVAS' && <GestorReservasSidebar />}
          </aside>
        )}

        {/* Main content */}
        <main className="flex flex-col flex-1 min-w-0 overflow-y-auto">
          {hasSidebar && (
            <div className="px-6 md:px-8 py-3 border-b border-gray-100 flex items-center gap-2 text-xs text-gray-400 shrink-0">
              <span className="font-semibold text-primary-navy">{ROLE_LABELS[role as UserRole] ?? role}</span>
              <ChevronRight size={12} />
              <span className="text-gray-500">{pathLabel}</span>
            </div>
          )}

          <div className="flex-1 p-6 md:p-8">
            {children}
          </div>
        </main>
      </div>

      <MobileNav />
      <Footer />
    </div>
  );
};
