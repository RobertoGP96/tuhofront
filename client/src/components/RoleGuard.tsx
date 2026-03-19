import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import type { UserRole } from '../types/auth.types';

interface RoleGuardProps {
  roles: UserRole[];
  children: ReactNode;
  fallback?: ReactNode;
  requireAuth?: boolean;
}

export function RoleGuard({ roles, children, fallback, requireAuth = true }: RoleGuardProps) {
  const { user, isAuthenticated, isLoading, isAdmin } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-primary-navy">
        <div className="h-12 w-12 animate-spin rounded-full border-4 text-secondary-lime border-secondary-lime border-t-transparent"></div>
      </div>
    );
  }

  if (requireAuth && !isAuthenticated) {
    return fallback ? <>{fallback}</> : <Navigate to="/login" replace />;
  }

  const hasRole =
    (roles.includes('ADMIN') && isAdmin) ||
    (user?.user_type != null && roles.includes(user.user_type));

  if (!hasRole) {
    return fallback ? <>{fallback}</> : <Navigate to="/forbidden" replace />;
  }

  return <>{children}</>;
}
