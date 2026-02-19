import { BaseModel } from './base';

/**
 * Notification type definitions
 */
export type NotificationType = 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR' | 'SYSTEM';

/**
 * Main Notification interface
 */
export interface Notification extends BaseModel {
  id: number;
  usuario: number;
  titulo: string;
  mensaje: string;
  tipo: NotificationType;
  leida: boolean;
  leida_el: string | null;
  data?: Record<string, any>;
}

/**
 * Data required to create a new notification
 */
export interface CreateNotificationData {
  usuario: number;
  titulo: string;
  mensaje: string;
  tipo: NotificationType;
  data?: Record<string, any>;
}

/**
 * Filter options for notifications
 */
export interface NotificationFilters {
  leida?: boolean;
  tipo?: NotificationType;
  usuario?: number;
  desde?: string;
  hasta?: string;
  page?: number;
  page_size?: number;
}

