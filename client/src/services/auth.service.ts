
import apiClient from '../lib/api-client';
import type { AuthResponse, User } from '../types/auth.types';

export const authService = {
  async login(username: string, password: string): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/login/', {
      username,
      password,
    });
    
    if (response.data.access) {
      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);
    }
    
    return response.data;
  },

  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  },

  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<User>('/users/me/');
    return response.data;
  },

  setStoredUser(user: User) {
    localStorage.setItem('user', JSON.stringify(user));
  },

  getStoredUser(): User | null {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
};
