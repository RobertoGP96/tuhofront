
import { Routes, Route } from 'react-router';
import routes from './paths';
import Home from '../pages/Home';
import { Contact } from '../pages/Contact';
import { News } from '../pages/News';
import { Login } from '../pages/Login';
import { Register } from '../pages/Register';
import { TeachingSecretary } from '../pages/TeachingSecretary';
import { Porfile } from '../pages/Porfile';
import { Procedures } from '../pages/Procedures';
import { Admin } from '../pages/Admin';
import { UsersAdmin } from '../components/platform/admin/users/Users';
import { StructureAdmin } from '../components/platform/admin/structure/StructureAdmin';
import { RolesAdmin } from '../components/platform/admin/rols/Rols';
import { DashboardAdmin } from '../components/platform/admin/dashboard/Dashboard';

import InternalAdmin from '../pages/internal/InternalAdmin.tsx';
import InternalConfig from '../pages/internal/InternalConfig.tsx';
import MyProcedures from '../pages/internal/MyProcedures.tsx';

import InternalLayout from '../pages/internal/InternalLayout';
import EmailConfig from '../components/platform/admin/config/EmailConfig.tsx';
import NotFound from '../pages/not-found';

import { Transport, Accomodation, Feeding, Maintence } from '../pages/internal/procedures'

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path={routes.home} element={<Home />} />
      <Route path={routes.support} element={<Contact />} />
      <Route path={routes.news} element={<News />} />
      
      {/* Rutas de secretaría */}
      <Route path={routes.secretary.detail()} element={<TeachingSecretary />} />
      <Route path={routes.secretary.undernat} element={<TeachingSecretary />} />
      <Route path={routes.secretary.underinter} element={<TeachingSecretary />} />
      <Route path={routes.secretary.postnat} element={<TeachingSecretary />} />
      <Route path={routes.secretary.postinter} element={<TeachingSecretary />} />
      <Route path={routes.secretary.legaliz} element={<TeachingSecretary />} />

      <Route path={routes.profile} element={<Porfile />} />
      <Route path={routes.procedures} element={<Procedures />} />

      <Route path={routes.login} element={<Login />} />
      <Route path={routes.register} element={<Register />} />

      <Route path={routes.admin.root} element={<Admin />}>
        <Route index element={<DashboardAdmin />} />
        <Route path="users" element={<UsersAdmin />} />
        <Route path="structure" element={<StructureAdmin />} />
        <Route path="roles" element={<RolesAdmin />} />
        <Route path="dashboard" element={<DashboardAdmin />} />
        <Route path="email" element={<EmailConfig />} />


        <Route path="internal/procedures" element={<InternalAdmin />} />
        <Route path="internal/personal" element={<InternalAdmin />} />
        <Route path="internal/config" element={<InternalConfig />} />
      </Route>

      <Route path={routes.internalAdmin()} element={<InternalAdmin />} />
      <Route path={routes.myProcedures} element={<MyProcedures />} />

      {/* Layout base para sección interna */}
      <Route path={routes.internal.root} element={<InternalLayout />}>
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
  );
};
