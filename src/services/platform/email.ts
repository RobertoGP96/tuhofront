import { apiClient } from '@/lib/client';
import type { PaginatedResponse } from '@/lib/client';

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
// NOTA: El endpoint /v1/emails/ no existe en el backend
const EMAIL_ENDPOINTS = {
  EMAILS: '/v1/config/email/',
} as const;

class EmailService {
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

  async getEmailConfigById(id: number): Promise<EmailConfig> {
    const response = await apiClient.get<EmailConfig>(
      `${EMAIL_ENDPOINTS.EMAILS}${id}/`
    );

    return response;
  }

  async createEmailConfig(data: CreateEmailConfigData): Promise<EmailConfig> {
    const response = await apiClient.post<EmailConfig>(
      EMAIL_ENDPOINTS.EMAILS,
      data
    );

    return response;
  }

  async updateEmailConfig(id: number, data: UpdateEmailConfigData): Promise<EmailConfig> {
    const response = await apiClient.patch<EmailConfig>(
      `${EMAIL_ENDPOINTS.EMAILS}${id}/`,
      data
    );

    return response;
  }

  async deleteEmailConfig(id: number): Promise<void> {
    await apiClient.delete(`${EMAIL_ENDPOINTS.EMAILS}${id}/`);
  }
}

export const emailService = new EmailService();
export default emailService;
