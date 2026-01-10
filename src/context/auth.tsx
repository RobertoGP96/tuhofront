import { apiClient } from '@/lib/client';
import { authService } from '@/services/auth/auth';
import type { LoginCredentials, User } from '@/types/users/auth';
import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react';

type AuthContextValue = {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const AUTH_STORAGE_KEY = 'tuhofront_auth';

export const AuthProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(AUTH_STORAGE_KEY);
      if (raw) {
        const { user, token, refresh } = JSON.parse(raw);
        setUser(user ?? null);
        setToken(token ?? null);
        setRefreshToken(refresh ?? null);
        if (token) {
          apiClient.setAuthToken(token);
        }
      }
    } catch {
      // no-op
    }
  }, []);

  const persistAuthData = useCallback((user: User | null, accessToken: string | null, refreshToken: string | null) => {
    setUser(user);
    setToken(accessToken);
    setRefreshToken(refreshToken);

    if (accessToken) {
      apiClient.setAuthToken(accessToken);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ user, token: accessToken, refresh: refreshToken }));
    } else {
      apiClient.clearAuthToken();
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    const response = await authService.login(credentials);
    if (response.user && response.access) {
      persistAuthData(response.user, response.access, response.refresh);
    }
  }, [persistAuthData]);

  const logout = useCallback(async () => {
    await authService.logout(refreshToken ?? undefined);
    persistAuthData(null, null, null);
  }, [refreshToken, persistAuthData]);

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
