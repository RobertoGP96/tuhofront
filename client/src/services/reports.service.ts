import apiClient from '../lib/api-client';

export interface OverviewStats {
  users: {
    total: number;
    active: number;
    new_last_30_days: number;
  };
  procedures: Record<string, {
    total: number;
    last_30_days: number;
    by_state: Record<string, number>;
  }>;
  reservations: {
    total?: number;
    last_30_days?: number;
    by_state?: Record<string, number>;
    active_locals?: number;
  };
}

export interface MonthlyRow {
  month: string | null;
  total: number;
}

export interface LocalOccupancyRow {
  local_id: string;
  code: string;
  name: string;
  capacity: number;
  total_reservations: number;
  approved: number;
  finished: number;
  rejected: number;
}

export const reportsService = {
  async overview(): Promise<OverviewStats> {
    const { data } = await apiClient.get<OverviewStats>('/reports/overview/');
    return data;
  },

  async proceduresByMonth(): Promise<Record<string, MonthlyRow[]>> {
    const { data } = await apiClient.get<Record<string, MonthlyRow[]>>('/reports/procedures-by-month/');
    return data;
  },

  async localOccupancy(): Promise<LocalOccupancyRow[]> {
    const { data } = await apiClient.get<LocalOccupancyRow[]>('/reports/local-occupancy/');
    return data;
  },

  exportXlsxUrl(): string {
    const baseUrl = (import.meta as unknown as { env: Record<string, string> }).env?.VITE_API_URL || '/api/v1';
    return `${baseUrl}/reports/export.xlsx`;
  },
};
