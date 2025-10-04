
import { Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import routes from './paths';

// Lazy loading para mejorar rendimiento
const Home = lazy(() => import('../pages/Home'));
const Contact = lazy(() => import('../pages/Contact').then(module => ({ default: module.Contact })));
const News = lazy(() => import('../pages/News').then(module => ({ default: module.News })));
const Login = lazy(() => import('../pages/Login').then(module => ({ default: module.Login })));
const Register = lazy(() => import('../pages/Register').then(module => ({ default: module.Register })));
const TeachingSecretary = lazy(() => import('../pages/TeachingSecretary').then(module => ({ default: module.TeachingSecretary })));
const Porfile = lazy(() => import('../pages/Porfile').then(module => ({ default: module.Porfile })));
const Procedures = lazy(() => import('../pages/Procedures').then(module => ({ default: module.Procedures })));
const Admin = lazy(() => import('../pages/Admin').then(module => ({ default: module.Admin })));
const UsersAdmin = lazy(() => import('../components/platform/admin/users/Users').then(module => ({ default: module.UsersAdmin })));
const StructureAdmin = lazy(() => import('../components/platform/admin/structure/StructureAdmin').then(module => ({ default: module.StructureAdmin })));
const RolesAdmin = lazy(() => import('../components/platform/admin/rols/Rols').then(module => ({ default: module.RolesAdmin })));
const DashboardAdmin = lazy(() => import('../components/platform/admin/dashboard/Dashboard').then(module => ({ default: module.DashboardAdmin })));
const InternalAdmin = lazy(() => import('../pages/admin/internal/InternalAdmin'));
const InternalConfig = lazy(() => import('../pages/admin/internal/InternalConfig'));
const MyProcedures = lazy(() => import('../pages/admin/internal/MyProcedures'));
const InternalLayout = lazy(() => import('../pages/admin/internal/InternalLayout'));
const EmailConfig = lazy(() => import('../components/platform/admin/config/EmailConfig'));
const NotFound = lazy(() => import('../pages/not-found'));
const Transport = lazy(() => import('../pages/admin/internal/procedures').then(module => ({ default: module.Transport })));
const Accomodation = lazy(() => import('../pages/admin/internal/procedures').then(module => ({ default: module.Accomodation })));
const Feeding = lazy(() => import('../pages/admin/internal/procedures').then(module => ({ default: module.Feeding })));
const Maintence = lazy(() => import('../pages/admin/internal/procedures').then(module => ({ default: module.Maintence })));

// Componente de loading
const RouteLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <p className="text-gray-600">Cargando...</p>
    </div>
  </div>
);

export const AppRoutes = () => {
  return (
    <Suspense fallback={<RouteLoader />}>
      <Routes>
      <Route path={routes.home} element={<Home />} />
      <Route path={routes.support} element={<Contact />} />
      <Route path={routes.news} element={<News />} />
      
      {/* Rutas de secretaría */}
      <Route path={routes.procedures.secretary.detail()} element={<TeachingSecretary />} />
      <Route path={routes.procedures.secretary.undernat} element={<TeachingSecretary />} />
      <Route path={routes.procedures.secretary.underinter} element={<TeachingSecretary />} />
      <Route path={routes.procedures.secretary.postnat} element={<TeachingSecretary />} />
      <Route path={routes.procedures.secretary.postinter} element={<TeachingSecretary />} />
      <Route path={routes.procedures.secretary.legaliz} element={<TeachingSecretary />} />

      <Route path={routes.profile} element={<Porfile />} />
      <Route path={routes.procedures.root} element={<Procedures />} />

      <Route path={routes.login} element={<Login />} />
      <Route path={routes.register} element={<Register />} />

      <Route path={routes.admin.root} element={<Admin />}>
        <Route index element={<DashboardAdmin />} />
        <Route path="users" element={<UsersAdmin />} />
        <Route path="structure" element={<StructureAdmin />} />
        <Route path="roles" element={<RolesAdmin />} />
        <Route path="dashboard" element={<DashboardAdmin />} />
        <Route path="email" element={<EmailConfig />} />

        {/* Rutas de administración interna */}
        <Route path="internal/procedures" element={<InternalAdmin />} />
        <Route path="internal/personal" element={<InternalAdmin />} />
        <Route path="internal/config" element={<InternalConfig />} />

        {/* Rutas de administración de secretaría */}
        <Route path="secretary/procedures" element={<TeachingSecretary />} />
        <Route path="secretary/personal" element={<UsersAdmin />} />
        <Route path="secretary/config" element={<InternalConfig />} />
      </Route>

      <Route path={routes.internalAdmin()} element={<InternalAdmin />} />
      <Route path={routes.myProcedures} element={<MyProcedures />} />

      {/* Layout base para sección interna */}
      <Route path={routes.procedures.internal.root} element={<InternalLayout />}>
        <Route index element={<InternalConfig />} />
        <Route path="config" element={<InternalConfig />} />
        {/* Rutas de procedimientos internos como rutas anidadas dentro del layout */}
        <Route path="procedures/feeding" element={<Feeding />} />
        <Route path="procedures/transport" element={<Transport />} />
        <Route path="procedures/maintenance" element={<Maintence />} />
        <Route path="procedures/accommodation" element={<Accomodation />} />
      </Route>

      {/* Ruta fallback para páginas no encontradas - DEBE SER LA ÚLTIMA */}
      <Route path="*" element={<NotFound />} />

      </Routes>
    </Suspense>
  );
};
