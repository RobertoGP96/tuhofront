import { apiClient } from '../api';
import type { PaginatedResponse } from '../api/client';

export interface EmailConfig {
  id: number;
  host: string;
  port: number;
  use_tls: boolean;
  use_ssl: boolean;
  username: string;
  password?: string;
  from_email: string;
  from_name?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateEmailConfigData {
  host: string;
  port: number;
  use_tls: boolean;
  use_ssl: boolean;
  username: string;
  password: string;
  from_email: string;
  from_name?: string;
}

export interface UpdateEmailConfigData extends Partial<CreateEmailConfigData> {}

// Endpoints de configuración de email
const EMAIL_ENDPOINTS = {
  EMAILS: '/v1/emails/',
} as const;

class EmailService {
  /**
   * Obtener lista de configuraciones de email
   */
  async getEmailConfigs(
    page = 1,
    pageSize = 10
  ): Promise<PaginatedResponse<EmailConfig>> {
    const params = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString(),
    });

    const response = await apiClient.get<PaginatedResponse<EmailConfig>>(
      `${EMAIL_ENDPOINTS.EMAILS}?${params}`
    );

    return response;
  }

  /**
   * Obtener una configuración de email por ID
   */
  async getEmailConfigById(id: number): Promise<EmailConfig> {
    const response = await apiClient.get<EmailConfig>(
      `${EMAIL_ENDPOINTS.EMAILS}${id}/`
    );

    return response;
  }

  /**
   * Crear una nueva configuración de email
   */
  async createEmailConfig(data: CreateEmailConfigData): Promise<EmailConfig> {
    const response = await apiClient.post<EmailConfig>(
      EMAIL_ENDPOINTS.EMAILS,
      data
    );

    return response;
  }

  /**
   * Actualizar una configuración de email
   */
  async updateEmailConfig(id: number, data: UpdateEmailConfigData): Promise<EmailConfig> {
    const response = await apiClient.patch<EmailConfig>(
      `${EMAIL_ENDPOINTS.EMAILS}${id}/`,
      data
    );

    return response;
  }

  /**
   * Eliminar una configuración de email
   */
  async deleteEmailConfig(id: number): Promise<void> {
    await apiClient.delete(`${EMAIL_ENDPOINTS.EMAILS}${id}/`);
  }
}

// Instancia singleton del servicio de email
export const emailService = new EmailService();

// Export default para compatibilidad
export default emailService;

