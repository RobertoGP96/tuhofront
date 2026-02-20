
import apiClient from '../lib/api-client';
import type { AuthResponse, User, RegisterData } from '../types/auth.types';

export const authService = {
  async register(data: RegisterData): Promise<void> {
    const payload = {
      username: String(data.username),
      email: String(data.email),
      password: String(data.password),
      password_confirm: String(data.password_confirm),
      first_name: String(data.first_name),
      last_name: String(data.last_name),
      id_card: String(data.id_card),
      phone: data.phone ? String(data.phone) : '',
      workplace: data.workplace ? String(data.workplace) : '',
      date_of_birth: data.date_of_birth ? String(data.date_of_birth) : '',
    };
    
    await apiClient.post('/users/', payload);
  },

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
