
import apiClient from '../lib/api-client';
import type { AuthResponse, User, RegisterData } from '../types/auth.types';

export const authService = {
  async register(data: RegisterData): Promise<void> {
    const formData = new FormData();
    formData.append('username', data.username);
    formData.append('email', data.email);
    formData.append('password', data.password);
    formData.append('password_confirm', data.password_confirm);
    formData.append('first_name', data.first_name);
    formData.append('last_name', data.last_name);
    formData.append('id_card', data.id_card);
    if (data.phone) formData.append('phone', data.phone);
    if (data.workplace) formData.append('workplace', data.workplace);
    if (data.date_of_birth) formData.append('date_of_birth', data.date_of_birth);
    
    console.log('FormData entries:');
    for (const [key, value] of formData.entries()) {
      console.log(`  ${key}: ${value}`);
    }
    
    await apiClient.post('/users/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    });
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
