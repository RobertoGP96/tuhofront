
import { apiClient, type PaginatedResponse } from '@/lib/client';
import type {
  CreateNotificationData,
  Notification,
  NotificationFilters,
} from '@/types/notification';

// Endpoints de notificaciones
const NOTIFICATION_ENDPOINTS = {
  NOTIFICATIONS: '/v1/notificaciones/',
} as const;

class NotificationService {
  /**
   * Obtener lista de notificaciones con filtros y paginación
   */
  async getNotifications(
    filters: NotificationFilters = {}
  ): Promise<PaginatedResponse<Notification>> {
    const { page = 1, page_size = 20, ...rest } = filters;
    const params = new URLSearchParams({
      page: page.toString(),
      page_size: page_size.toString(),
    });

    // Agregar filtros si existen
    Object.entries(rest).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });

    const response = await apiClient.get<PaginatedResponse<Notification>>(
      `${NOTIFICATION_ENDPOINTS.NOTIFICATIONS}?${params}`
    );

    return response;
  }

  /**
   * Obtener notificaciones del usuario actual
   */
  async getMyNotifications(
    filters: NotificationFilters = {}
  ): Promise<PaginatedResponse<Notification>> {
    return this.getNotifications(filters);
  }

  /**
   * Obtener una notificación por ID
   */
  async getNotificationById(id: number): Promise<Notification> {
    const response = await apiClient.get<Notification>(
      `${NOTIFICATION_ENDPOINTS.NOTIFICATIONS}${id}/`
    );

    return response;
  }

  /**
   * Crear una nueva notificación
   */
  async createNotification(data: CreateNotificationData): Promise<Notification> {
    const response = await apiClient.post<Notification>(
      NOTIFICATION_ENDPOINTS.NOTIFICATIONS,
      data
    );

    return response;
  }

  /**
   * Marcar notificación como leída
   */
  async markAsRead(id: number): Promise<Notification> {
    const response = await apiClient.patch<Notification>(
      `${NOTIFICATION_ENDPOINTS.NOTIFICATIONS}${id}/`,
      { leida: true }
    );

    return response;
  }

  /**
   * Eliminar una notificación
   */
  async deleteNotification(id: number): Promise<void> {
    await apiClient.delete(`${NOTIFICATION_ENDPOINTS.NOTIFICATIONS}${id}/`);
  }
}

// Instancia singleton del servicio de notificaciones
export const notificationService = new NotificationService();

// Export default para compatibilidad
export default notificationService;