import apiClient from '../lib/api-client';
import type { Notificacion, NotificacionStats, NotificacionListResponse } from '../types/notifications.types';

const BASE_URL = '/notificaciones';

export const notificationsService = {
  async getAll(params?: {
    page?: number;
    page_size?: number;
    tipo?: string;
    prioridad?: string;
    visto?: boolean;
  }): Promise<NotificacionListResponse> {
    const response = await apiClient.get<NotificacionListResponse>(`${BASE_URL}/`, { params });
    return response.data;
  },

  async getUnread(): Promise<Notificacion[]> {
    const response = await apiClient.get<Notificacion[]>(`${BASE_URL}/sin_leer/`);
    return response.data;
  },

  async getStats(): Promise<NotificacionStats> {
    const response = await apiClient.get<NotificacionStats>(`${BASE_URL}/estadisticas/`);
    return response.data;
  },

  async markAsRead(id: number): Promise<void> {
    await apiClient.post(`${BASE_URL}/${id}/marcar_leida/`);
  },

  async markAllAsRead(): Promise<void> {
    await apiClient.post(`${BASE_URL}/marcar_todas_leidas/`);
  },
};
