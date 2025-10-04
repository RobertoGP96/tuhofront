import { useAuth } from '../hooks/use-auth';

// Hook para navegación programática con verificación de roles
export const useProtectedNavigation = () => {
  const { user, isAuthenticated } = useAuth();

  const canAccess = (requiredRole?: string | string[]) => {
    if (!isAuthenticated) return false;
    
    if (!requiredRole) return true;
    
    if (!user) return false;
    
    const userRoles = Array.isArray(user.role) ? user.role : [user.role];
    const requiredRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    
    return requiredRoles.some(role => userRoles.includes(role));
  };

  return { canAccess };
};