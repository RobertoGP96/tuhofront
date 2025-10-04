import { useContext } from 'react';
import AuthContext from '../context/auth';

type User = { id?: number; name?: string; email?: string } & Record<string, unknown>;

type AuthContextValue = {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

export function useAuth() {
  const ctx = useContext(AuthContext) as AuthContextValue | undefined;
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export default useAuth;
