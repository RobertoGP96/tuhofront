import React from 'react';
import { Navbar } from '../components/Navbar';
import { MobileNav } from '../components/MobileNav';
import { Footer } from '../components/Footer';
import { 
  LayoutDashboard, 
  Users, 
  Settings, 
  FileCheck,
  ChevronRight
} from 'lucide-react';
import { NavItem } from '../components/NavItem';
import { cn } from '../utils';

interface MainLayoutProps {
  children: React.ReactNode;
  role?: 'user' | 'admin';
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children, role = 'user' }) => {
  const isAdmin = role === 'admin';

  return (
    <div className="min-h-screen bg-white flex flex-col w-full">
      <Navbar role={role} />
      
      <div className="flex flex-1 pt-16 pb-16 md:pb-0">
        {/* Sidebar for Admin */}
        {isAdmin && (
          <aside className="hidden md:flex flex-col w-64 border-r border-gray-100 p-4 gap-2 bg-gray-50/30">
            <div className="px-4 py-2 mb-2">
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Panel Admin</h2>
            </div>
            <NavItem label="Dashboard" icon={LayoutDashboard} to="/admin" />
            <NavItem label="Usuarios" icon={Users} to="/admin/users" />
            <NavItem label="Trámites Pendientes" icon={FileCheck} to="/admin/procedures" />
            <NavItem label="Configuración" icon={Settings} to="/admin/settings" />
            
            <div className="mt-auto p-4 bg-primary-navy/5 rounded-xl">
              <p className="text-xs text-primary-navy font-semibold mb-1">Estado del Sistema</p>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-secondary-lime animate-pulse" />
                <span className="text-[10px] text-gray-500 font-medium">Operativo</span>
              </div>
            </div>
          </aside>
        )}

        {/* Main Content */}
        <main className={cn(
          "flex-1 flex flex-col w-full",
          isAdmin ? "bg-white" : "bg-white"
        )}>
          {/* Optional breadcrumbs or header for content */}
          {isAdmin && (
            <div className="px-4 md:px-8 py-4 border-b border-gray-50 flex items-center gap-2 text-xs text-gray-400">
              <span>Admin</span>
              <ChevronRight size={12} />
              <span className="text-primary-navy font-medium">Dashboard</span>
            </div>
          )}
          
          <div className="flex-1 p-4 md:p-8">
            {children}
          </div>
        </main>
      </div>

      <MobileNav />
      <Footer />
    </div>
  );
};
