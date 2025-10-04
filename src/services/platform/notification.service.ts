import { apiClient } from '../api';
import type {
  Notification,
  NotificationType,
  NotificationPriority,
  CreateNotificationData,
  NotificationFilters,
  NotificationStats
} from '../../types/platform/platform';
import type { ApiResponse, PaginatedResponse } from '../api/client';

// Endpoints de notificaciones
const NOTIFICATION_ENDPOINTS = {
  NOTIFICATIONS: '/platform/notifications/',
  NOTIFICATION_TYPES: '/platform/notification-types/',
  NOTIFICATION_PRIORITIES: '/platform/notification-priorities/',
  NOTIFICATION_STATS: '/platform/notifications/stats/',
  MARK_READ: '/platform/notifications/:id/mark-read/',
  MARK_ALL_READ: '/platform/notifications/mark-all-read/',
  MY_NOTIFICATIONS: '/platform/notifications/me/',
} as const;

class NotificationService {
  /**
   * Obtener lista de notificaciones con filtros y paginación
   */
  async getNotifications(
    filters?: NotificationFilters,
    page = 1,
    pageSize = 20
  ): Promise<PaginatedResponse<Notification>> {
    const params = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString(),
    });

    // Agregar filtros si existen
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });
    }

    const response = await apiClient.get<ApiResponse<PaginatedResponse<Notification>>>(
      `${NOTIFICATION_ENDPOINTS.NOTIFICATIONS}?${params}`
    );

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.message || 'Error al obtener notificaciones');
  }

  /**
   * Obtener notificaciones del usuario actual
   */
  async getMyNotifications(
    filters?: NotificationFilters,
    page = 1,
    pageSize = 20
  ): Promise<PaginatedResponse<Notification>> {
    const params = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString(),
    });

    // Agregar filtros si existen
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });
    }

    const response = await apiClient.get<ApiResponse<PaginatedResponse<Notification>>>(
      `${NOTIFICATION_ENDPOINTS.MY_NOTIFICATIONS}?${params}`
    );

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.message || 'Error al obtener mis notificaciones');
  }

  /**
   * Obtener una notificación por ID
   */
  async getNotificationById(id: number): Promise<Notification> {
    const response = await apiClient.get<ApiResponse<Notification>>(
      `${NOTIFICATION_ENDPOINTS.NOTIFICATIONS}${id}/`
    );

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.message || 'Error al obtener notificación');
  }

  /**
   * Crear una nueva notificación
   */
  async createNotification(data: CreateNotificationData): Promise<Notification> {
    const response = await apiClient.post<ApiResponse<Notification>>(
      NOTIFICATION_ENDPOINTS.NOTIFICATIONS,
      data
    );

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.message || 'Error al crear notificación');
  }

  /**
   * Marcar notificación como leída
   */
  async markAsRead(id: number): Promise<void> {
    const endpoint = NOTIFICATION_ENDPOINTS.MARK_READ.replace(':id', id.toString());
    const response = await apiClient.post<ApiResponse<null>>(endpoint);

    if (!response.success) {
      throw new Error(response.message || 'Error al marcar como leída');
    }
  }

  /**
   * Marcar todas las notificaciones como leídas
   */
  async markAllAsRead(): Promise<void> {
    const response = await apiClient.post<ApiResponse<null>>(
      NOTIFICATION_ENDPOINTS.MARK_ALL_READ
    );

    if (!response.success) {
      throw new Error(response.message || 'Error al marcar todas como leídas');
    }
  }

  /**
   * Eliminar una notificación
   */
  async deleteNotification(id: number): Promise<void> {
    const response = await apiClient.delete<ApiResponse<null>>(
      `${NOTIFICATION_ENDPOINTS.NOTIFICATIONS}${id}/`
    );

    if (!response.success) {
      throw new Error(response.message || 'Error al eliminar notificación');
    }
  }

  /**
   * Obtener tipos de notificaciones
   */
  async getNotificationTypes(): Promise<NotificationType[]> {
    const response = await apiClient.get<ApiResponse<NotificationType[]>>(
      NOTIFICATION_ENDPOINTS.NOTIFICATION_TYPES
    );

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.message || 'Error al obtener tipos de notificaciones');
  }

  /**
   * Obtener prioridades de notificaciones
   */
  async getNotificationPriorities(): Promise<NotificationPriority[]> {
    const response = await apiClient.get<ApiResponse<NotificationPriority[]>>(
      NOTIFICATION_ENDPOINTS.NOTIFICATION_PRIORITIES
    );

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.message || 'Error al obtener prioridades de notificaciones');
  }

  /**
   * Obtener estadísticas de notificaciones
   */
  async getNotificationStats(): Promise<NotificationStats> {
    const response = await apiClient.get<ApiResponse<NotificationStats>>(
      NOTIFICATION_ENDPOINTS.NOTIFICATION_STATS
    );

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.message || 'Error al obtener estadísticas');
  }

  /**
   * Obtener número de notificaciones no leídas
   */
  async getUnreadCount(): Promise<number> {
    const response = await apiClient.get<ApiResponse<{ count: number }>>(
      `${NOTIFICATION_ENDPOINTS.MY_NOTIFICATIONS}unread-count/`
    );

    if (response.success && response.data) {
      return response.data.count;
    }

    throw new Error(response.message || 'Error al obtener conteo de no leídas');
  }

  /**
   * Enviar notificación push
   */
  async sendPushNotification(notificationId: number): Promise<void> {
    const response = await apiClient.post<ApiResponse<null>>(
      `${NOTIFICATION_ENDPOINTS.NOTIFICATIONS}${notificationId}/send-push/`
    );

    if (!response.success) {
      throw new Error(response.message || 'Error al enviar notificación push');
    }
  }

  /**
   * Crear notificación masiva
   */
  async createBulkNotification(data: {
    title: string;
    message: string;
    type_id: number;
    priority_id: number;
    user_filters?: any;
    action_url?: string;
    metadata?: Record<string, any>;
  }): Promise<{ sent: number; failed: number }> {
    const response = await apiClient.post<ApiResponse<{ sent: number; failed: number }>>(
      `${NOTIFICATION_ENDPOINTS.NOTIFICATIONS}bulk/`,
      data
    );

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.message || 'Error al crear notificaciones masivas');
  }
}

// Instancia singleton del servicio de notificaciones
export const notificationService = new NotificationService();

// Export default para compatibilidad
export default notificationService;