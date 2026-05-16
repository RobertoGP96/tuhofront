
import { useAuthContext } from '../context/AuthContext';

export const useAuth = () => {
  const { user, isAuthenticated, isLoading, login, logout } = useAuthContext();

  const userRole = user?.user_type ?? null;
  const isStaff = user?.is_staff === true;

  const isAdmin = user?.role === 'ADMIN' || isStaff || userRole === 'ADMIN';
  const isUsuario = userRole === 'USUARIO';
  const isGestorInterno = userRole === 'GESTOR_INTERNO';
  const isGestorSecretaria = userRole === 'GESTOR_SECRETARIA';
  const isGestorReservas = userRole === 'GESTOR_RESERVAS';
  const isAnyGestor = isGestorInterno || isGestorSecretaria || isGestorReservas;
  const isPersonalUser = isUsuario || (!isAdmin && !isAnyGestor);

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    userRole,
    isAdmin,
    isUsuario,
    isGestorInterno,
    isGestorSecretaria,
    isGestorReservas,
    isAnyGestor,
    isPersonalUser,
    canManageSecretary: isStaff || userRole === 'ADMIN' || userRole === 'GESTOR_SECRETARIA',
    canManageInternal: isStaff || userRole === 'ADMIN' || userRole === 'GESTOR_INTERNO',
    canManageReservas: isStaff || userRole === 'ADMIN' || userRole === 'GESTOR_RESERVAS',
  };
};
