import apiClient from '../lib/api-client';
import type { PaginatedResponse } from '../types/procedures.types';

// --- Department ---

export interface Department {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface DepartmentPayload {
  name: string;
}

// --- Area ---

export interface Area {
  id: number;
  name: string;
  department: number;
  department_name?: string;
  created_at: string;
  updated_at: string;
}

export interface AreaPayload {
  name: string;
  department: number;
}

// --- News ---

export type NewsCategory =
  | 'GENERAL'
  | 'ACADEMIC'
  | 'MANAGEMENT'
  | 'STUDENT'
  | 'CULTURAL'
  | 'SPORTS'
  | 'RESEARCH'
  | 'EXTENSION';

export interface NewsItem {
  id: number;
  title: string;
  slug: string;
  category: NewsCategory;
  header_image: string | null;
  summary: string | null;
  body: string;
  is_published: boolean;
  publication_date: string | null;
  featured: boolean;
  tags: string;
  author_name?: string | null;
  tag_list?: string[];
  read_time?: number;
  created_at: string;
  updated_at: string;
}

export interface NewsDetailItem extends NewsItem {
  author_name: string | null;
  author_email: string | null;
  tag_list: string[];
  related_news: NewsItem[];
  read_time: number;
  absolute_url?: string;
}

export interface NewsPayload {
  title: string;
  category: NewsCategory;
  summary?: string;
  body: string;
  is_published?: boolean;
  publication_date?: string | null;
  featured?: boolean;
  tags?: string;
}

export interface GetNewsParams {
  page?: number;
  page_size?: number;
  search?: string;
  category?: string;
  is_published?: boolean;
}

// --- Config Types ---

export interface NamedConfig {
  id: number;
  name: string;
}

export interface NamedConfigPayload {
  name: string;
}

// --- Service ---

export const platformService = {
  // Departments
  async getDepartments(): Promise<Department[]> {
    const response = await apiClient.get<Department[] | PaginatedResponse<Department>>(
      '/internal/departments/'
    );
    const data = response.data;
    if (Array.isArray(data)) return data;
    return data.results;
  },

  async createDepartment(payload: DepartmentPayload): Promise<Department> {
    const response = await apiClient.post<Department>('/internal/departments/', payload);
    return response.data;
  },

  async updateDepartment(id: number, payload: Partial<DepartmentPayload>): Promise<Department> {
    const response = await apiClient.patch<Department>(`/internal/departments/${id}/`, payload);
    return response.data;
  },

  async deleteDepartment(id: number): Promise<void> {
    await apiClient.delete(`/internal/departments/${id}/`);
  },

  // Areas
  async getAreas(params?: { department?: number; page?: number }): Promise<Area[]> {
    const response = await apiClient.get<Area[] | PaginatedResponse<Area>>(
      '/internal/areas/',
      { params }
    );
    const data = response.data;
    if (Array.isArray(data)) return data;
    return data.results;
  },

  async createArea(payload: AreaPayload): Promise<Area> {
    const response = await apiClient.post<Area>('/internal/areas/', payload);
    return response.data;
  },

  async updateArea(id: number, payload: Partial<AreaPayload>): Promise<Area> {
    const response = await apiClient.patch<Area>(`/internal/areas/${id}/`, payload);
    return response.data;
  },

  async deleteArea(id: number): Promise<void> {
    await apiClient.delete(`/internal/areas/${id}/`);
  },

  // News
  async getNews(params?: GetNewsParams): Promise<PaginatedResponse<NewsItem>> {
    const response = await apiClient.get<PaginatedResponse<NewsItem>>('/news/', { params });
    return response.data;
  },

  async getNewsBySlug(slug: string): Promise<NewsDetailItem> {
    const response = await apiClient.get<NewsDetailItem>(`/news/${slug}/`);
    return response.data;
  },

  async createNews(payload: NewsPayload): Promise<NewsItem> {
    const response = await apiClient.post<NewsItem>('/news/', payload);
    return response.data;
  },

  async updateNews(slug: string, payload: Partial<NewsPayload>): Promise<NewsItem> {
    const response = await apiClient.patch<NewsItem>(`/news/${slug}/`, payload);
    return response.data;
  },

  async deleteNews(slug: string): Promise<void> {
    await apiClient.delete(`/news/${slug}/`);
  },

  // Transport Procedure Types
  async getTransportTypes(): Promise<NamedConfig[]> {
    const response = await apiClient.get<NamedConfig[] | PaginatedResponse<NamedConfig>>(
      '/internal/transport-procedure-types/'
    );
    const data = response.data;
    if (Array.isArray(data)) return data;
    return data.results;
  },

  async createTransportType(payload: NamedConfigPayload): Promise<NamedConfig> {
    const response = await apiClient.post<NamedConfig>('/internal/transport-procedure-types/', payload);
    return response.data;
  },

  async updateTransportType(id: number, payload: Partial<NamedConfigPayload>): Promise<NamedConfig> {
    const response = await apiClient.patch<NamedConfig>(`/internal/transport-procedure-types/${id}/`, payload);
    return response.data;
  },

  async deleteTransportType(id: number): Promise<void> {
    await apiClient.delete(`/internal/transport-procedure-types/${id}/`);
  },

  // Maintenance Procedure Types
  async getMaintenanceTypes(): Promise<NamedConfig[]> {
    const response = await apiClient.get<NamedConfig[] | PaginatedResponse<NamedConfig>>(
      '/internal/maintance-procedure-types/'
    );
    const data = response.data;
    if (Array.isArray(data)) return data;
    return data.results;
  },

  async createMaintenanceType(payload: NamedConfigPayload): Promise<NamedConfig> {
    const response = await apiClient.post<NamedConfig>('/internal/maintance-procedure-types/', payload);
    return response.data;
  },

  async updateMaintenanceType(id: number, payload: Partial<NamedConfigPayload>): Promise<NamedConfig> {
    const response = await apiClient.patch<NamedConfig>(`/internal/maintance-procedure-types/${id}/`, payload);
    return response.data;
  },

  async deleteMaintenanceType(id: number): Promise<void> {
    await apiClient.delete(`/internal/maintance-procedure-types/${id}/`);
  },

  // Maintenance Priorities
  async getMaintenancePriorities(): Promise<NamedConfig[]> {
    const response = await apiClient.get<NamedConfig[] | PaginatedResponse<NamedConfig>>(
      '/internal/maintance-priorities/'
    );
    const data = response.data;
    if (Array.isArray(data)) return data;
    return data.results;
  },

  async createMaintenancePriority(payload: NamedConfigPayload): Promise<NamedConfig> {
    const response = await apiClient.post<NamedConfig>('/internal/maintance-priorities/', payload);
    return response.data;
  },

  async updateMaintenancePriority(id: number, payload: Partial<NamedConfigPayload>): Promise<NamedConfig> {
    const response = await apiClient.patch<NamedConfig>(`/internal/maintance-priorities/${id}/`, payload);
    return response.data;
  },

  async deleteMaintenancePriority(id: number): Promise<void> {
    await apiClient.delete(`/internal/maintance-priorities/${id}/`);
  },
};
