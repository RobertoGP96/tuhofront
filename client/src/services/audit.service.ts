import apiClient from '../lib/api-client';

export interface AuditLogEntry {
  id: number;
  user: number | null;
  user_username: string | null;
  user_full_name: string | null;
  action: string;
  action_display: string;
  resource_type: string;
  resource_id: string;
  description: string;
  metadata: Record<string, unknown>;
  ip_address: string | null;
  user_agent: string;
  created_at: string;
}

export interface AuditLogList {
  count: number;
  next: string | null;
  previous: string | null;
  results: AuditLogEntry[];
}

export const auditService = {
  async list(params?: {
    page?: number;
    page_size?: number;
    action?: string;
    user?: number;
    resource_type?: string;
    resource_id?: string;
    date_from?: string;
    date_to?: string;
  }): Promise<AuditLogList> {
    const { data } = await apiClient.get<AuditLogList>('/audit/logs/', { params });
    return data;
  },

  async resourceHistory(appLabel: string, model: string, pk: string): Promise<AuditLogEntry[]> {
    const { data } = await apiClient.get<AuditLogEntry[]>(
      `/audit/logs/resource/${appLabel}/${model}/${pk}/`,
    );
    return data;
  },
};
