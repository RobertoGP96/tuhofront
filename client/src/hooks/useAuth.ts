
import { useAuthContext } from '../context/AuthContext';

export const useAuth = () => {
  const { user, isAuthenticated, isLoading, login, logout } = useAuthContext();

  const userRole = user?.user_type ?? null;
  const isStaff = user?.is_staff === true;

  const isAdmin = user?.role === 'ADMIN' || isStaff || userRole === 'ADMIN';
  const isSecretaria = userRole === 'SECRETARIA_DOCENTE';
  const isGestorInterno = userRole === 'GESTOR_INTERNO';
  const isGestorTramites = userRole === 'GESTOR_TRAMITES';
  const isGestorReservas = userRole === 'GESTOR_RESERVAS';
  const isAnyGestor = isGestorInterno || isGestorTramites || isGestorReservas;
  const isPersonalUser = !isAdmin && !isAnyGestor && !isSecretaria;

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    userRole,
    isAdmin,
    isSecretaria,
    isProfesor: userRole === 'PROFESOR',
    isTrabajador: userRole === 'TRABAJADOR',
    isEstudiante: userRole === 'ESTUDIANTE',
    isExterno: userRole === 'EXTERNO',
    isGestorInterno,
    isGestorTramites,
    isGestorReservas,
    isAnyGestor,
    isPersonalUser,
    canAccessInternal: isStaff || userRole === 'ADMIN' || userRole === 'PROFESOR' || userRole === 'TRABAJADOR',
    canManageSecretary: isStaff || userRole === 'ADMIN' || userRole === 'SECRETARIA_DOCENTE',
    canManageInternal: isStaff || userRole === 'ADMIN' || userRole === 'GESTOR_INTERNO',
    canManageTramites: isStaff || userRole === 'ADMIN' || userRole === 'GESTOR_TRAMITES',
    canManageReservas: isStaff || userRole === 'ADMIN' || userRole === 'GESTOR_RESERVAS',
  };
};
