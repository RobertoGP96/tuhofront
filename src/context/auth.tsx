import { apiClient } from '@/lib/client';
import { authService } from '@/services/auth/auth';
import type { LoginCredentials, User } from '@/types/users/auth';
import Cookies from 'js-cookie';
import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react';

type AuthContextValue = {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const COOKIE_OPTIONS = { secure: true, sameSite: 'strict' } as const;

export const AuthProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = Cookies.get('token');
    const storedRefreshToken = Cookies.get('refresh_token');
    const storedUser = Cookies.get('user');

    if (storedToken) {
      setToken(storedToken);
      apiClient.setAuthToken(storedToken);
    }
    if (storedRefreshToken) {
      setRefreshToken(storedRefreshToken);
    }
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        setUser(null);
      }
    }
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    const response = await authService.login(credentials);
    if (response.user && response.access) {
      setUser(response.user);
      setToken(response.access);
      Cookies.set('token', response.access, COOKIE_OPTIONS);
      Cookies.set('user', JSON.stringify(response.user), COOKIE_OPTIONS);

      if (response.refresh) {
        setRefreshToken(response.refresh);
        Cookies.set('refresh_token', response.refresh, COOKIE_OPTIONS);
      } else {
        setRefreshToken(null);
        Cookies.remove('refresh_token');
      }
    }
  }, []);

  const logout = useCallback(async () => {
    await authService.logout(refreshToken ?? undefined);
    setUser(null);
    setToken(null);
    setRefreshToken(null);
    Cookies.remove('token');
    Cookies.remove('refresh_token');
    Cookies.remove('user');
  }, [refreshToken]);

  const value = useMemo(() => ({
    user,
    token,
    isAuthenticated: Boolean(token),
    login,
    logout,
  }), [user, token, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
