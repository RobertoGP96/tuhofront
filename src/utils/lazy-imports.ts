import { lazy } from 'react';

// Lazy loading organizado por categorías

// Páginas principales
export const lazyPages = {
  // Páginas públicas
  Home: lazy(() => import('@/pages/Home')),
  Contact: lazy(() => import('@/pages/Contact').then(m => ({ default: m.Contact }))),
  News: lazy(() => import('@/pages/News').then(m => ({ default: m.News }))),
  Login: lazy(() => import('@/pages/Login').then(m => ({ default: m.Login }))),
  Register: lazy(() => import('@/pages/Register').then(m => ({ default: m.Register }))),
  
  // Páginas de usuario
  Profile: lazy(() => import('@/pages/Profile').then(m => ({ default: m.Profile }))),
  Procedures: lazy(() => import('@/pages/Procedures').then(m => ({ default: m.Procedures }))),
  TeachingSecretary: lazy(() => import('@/pages/TeachingSecretary').then(m => ({ default: m.TeachingSecretary }))),
  
  // Páginas de administración
  Admin: lazy(() => import('@/pages/Admin').then(m => ({ default: m.Admin }))),
  
  // Páginas internas
  InternalAdmin: lazy(() => import('@/pages/admin/internal/InternalAdmin')),
  InternalConfig: lazy(() => import('@/pages/admin/internal/InternalConfig')),
  MyProcedures: lazy(() => import('@/pages/admin/internal/MyProcedures')),
  InternalLayout: lazy(() => import('@/pages/admin/internal/InternalLayout')),
  
  // Procedimientos internos
  Feeding: lazy(() => import('@/pages/admin/internal/procedures').then(m => ({ default: m.Feeding }))),
  Transport: lazy(() => import('@/pages/admin/internal/procedures').then(m => ({ default: m.Transport }))),
  Accommodation: lazy(() => import('@/pages/admin/internal/procedures').then(m => ({ default: m.Accomodation }))),
  Maintenance: lazy(() => import('@/pages/admin/internal/procedures').then(m => ({ default: m.Maintence }))),
  
  // Páginas de error
  NotFound: lazy(() => import('@/pages/not-found')),
} as const;

// Componentes administrativos
export const lazyAdminComponents = {
  UsersAdmin: lazy(() => import('@/components/platform/admin/users/Users').then(m => ({ default: m.UsersAdmin }))),
  StructureAdmin: lazy(() => import('@/components/platform/admin/structure/StructureAdmin').then(m => ({ default: m.StructureAdmin }))),
  RolesAdmin: lazy(() => import('@/components/platform/admin/rols/Rols').then(m => ({ default: m.RolesAdmin }))),
  DashboardAdmin: lazy(() => import('@/components/platform/admin/dashboard/Dashboard').then(m => ({ default: m.DashboardAdmin }))),
  EmailConfig: lazy(() => import('@/components/platform/admin/config/EmailConfig')),
} as const;

// Componentes internos (para carga dinámica)
export const lazyInternalComponents = {
  FeedingComponent: lazy(() => import('@/components/internal/FeedingComponent')),
  AccommodationComponent: lazy(() => import('@/components/internal/AccommodationComponent')),
  TransportComponent: lazy(() => import('@/components/internal/TransportComponent')),
  MaintanceComponent: lazy(() => import('@/components/internal/MaintanceComponent')),
  StateChangeDialog: lazy(() => import('@/components/internal/StateChangeDialog')),
  UserSidebar: lazy(() => import('@/components/internal/UserSidebar')),
} as const;

// Preload utilities para cargar componentes anticipadamente
export const preloadComponent = (componentLoader: () => Promise<any>) => {
  const componentImport = componentLoader();
  return componentImport;
};

// Preload crítico - cargar componentes que sabemos que se usarán pronto
export const preloadCriticalComponents = () => {
  // Precargar componentes que se usan frecuentemente
  preloadComponent(() => import('@/components/internal/FeedingComponent'));
  preloadComponent(() => import('@/components/platform/navbar/NavBar'));
  preloadComponent(() => import('@/components/platform/userchip/UserChipMenu'));
};