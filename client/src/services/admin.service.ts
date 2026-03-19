import apiClient from '../lib/api-client';
import type { PaginatedResponse } from '../types/procedures.types';
import type { User } from '../types/auth.types';

export interface AdminStats {
  total_procedures: number;
  pending_procedures: number;
  completed_procedures: number;
  active_users: number;
  [key: string]: unknown;
}

export interface AdminProcedure {
  id: string;
  follow_number: string;
  state: string;
  user: number;
  user_full_name?: string;
  created_at: string;
  updated_at: string;
}

export interface GetUsersParams {
  user_type?: string;
  is_active?: boolean;
  is_staff?: boolean;
  email_verified?: boolean;
  phone_verified?: boolean;
  search?: string;
  ordering?: string;
  page?: number;
}

export interface UpdateUserData {
  first_name?: string;
  last_name?: string;
  phone?: string;
  user_type?: string;
  is_active?: boolean;
}

export const adminService = {
  async getStats(): Promise<AdminStats> {
    const response = await apiClient.get<AdminStats>('/internal/stats/');
    return response.data;
  },

  async getRecentProcedures(limit = 5): Promise<PaginatedResponse<AdminProcedure>> {
    const response = await apiClient.get<PaginatedResponse<AdminProcedure>>('/procedures/', {
      params: { page_size: limit, ordering: '-created_at' },
    });
    return response.data;
  },

  async getRecentUsers(limit = 5): Promise<PaginatedResponse<User>> {
    const response = await apiClient.get<PaginatedResponse<User>>('/users/', {
      params: { page_size: limit, ordering: '-date_joined' },
    });
    return response.data;
  },

  async getUsers(params?: GetUsersParams): Promise<PaginatedResponse<User>> {
    const response = await apiClient.get<PaginatedResponse<User>>('/users/', { params });
    return response.data;
  },

  async updateUser(id: number, data: UpdateUserData): Promise<User> {
    const response = await apiClient.patch<User>(`/users/${id}/`, data);
    return response.data;
  },

  async deleteUser(id: number): Promise<void> {
    await apiClient.delete(`/users/${id}/`);
  },
};
