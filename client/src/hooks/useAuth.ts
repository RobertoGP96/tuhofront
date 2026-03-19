
import { useAuthContext } from '../context/AuthContext';

export const useAuth = () => {
  const { user, isAuthenticated, isLoading, login, logout } = useAuthContext();

  const userRole = user?.user_type ?? null;
  const isStaff = user?.is_staff === true;

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    userRole,
    isAdmin: user?.role === 'ADMIN' || isStaff || userRole === 'ADMIN',
    isSecretaria: userRole === 'SECRETARIA_DOCENTE',
    isProfesor: userRole === 'PROFESOR',
    isTrabajador: userRole === 'TRABAJADOR',
    isEstudiante: userRole === 'ESTUDIANTE',
    isExterno: userRole === 'EXTERNO',
    canAccessInternal: isStaff || userRole === 'ADMIN' || userRole === 'PROFESOR' || userRole === 'TRABAJADOR',
    canManageSecretary: isStaff || userRole === 'ADMIN' || userRole === 'SECRETARIA_DOCENTE',
  };
};
