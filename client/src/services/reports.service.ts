import apiClient from '../lib/api-client';
import { filenameFromContentDisposition, triggerBlobDownload } from '@/lib/download';

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

export type ReportFilters = {
  dateFrom?: string;
  dateTo?: string;
  state?: string;
  type?: string;
};

export type InternalDomain = 'feeding' | 'accommodation' | 'transport' | 'maintenance';

function toParams(filters: ReportFilters): Record<string, string> {
  const params: Record<string, string> = {};
  if (filters.dateFrom) params.date_from = filters.dateFrom;
  if (filters.dateTo) params.date_to = filters.dateTo;
  if (filters.state) params.state = filters.state;
  if (filters.type) params.type = filters.type;
  return params;
}

async function downloadPdf(url: string, filters: ReportFilters, fallbackName: string): Promise<void> {
  const response = await apiClient.get(url, {
    params: toParams(filters),
    responseType: 'blob',
  });
  const filename = filenameFromContentDisposition(
    response.headers?.['content-disposition'] as string | undefined,
    fallbackName,
  );
  triggerBlobDownload(response.data as Blob, filename);
}

export const reportsService = {
  // ----- JSON (existentes) -----
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

  // ----- PDF (nuevos) -----
  downloadAdminOverview(filters: ReportFilters = {}): Promise<void> {
    return downloadPdf('/reports/overview.pdf', filters, 'reporte-global.pdf');
  },

  downloadInternalDomain(domain: InternalDomain, filters: ReportFilters = {}): Promise<void> {
    return downloadPdf(`/reports/internal/${domain}.pdf`, filters, `reporte-${domain}.pdf`);
  },

  downloadProcedures(filters: ReportFilters = {}): Promise<void> {
    return downloadPdf('/reports/procedures.pdf', filters, 'reporte-tramites.pdf');
  },

  downloadReservations(filters: ReportFilters = {}): Promise<void> {
    return downloadPdf('/reports/reservations.pdf', filters, 'reporte-reservas.pdf');
  },

  downloadSecretary(filters: ReportFilters = {}): Promise<void> {
    return downloadPdf('/reports/secretary.pdf', filters, 'reporte-secretaria.pdf');
  },

  downloadMyHistory(filters: ReportFilters = {}): Promise<void> {
    return downloadPdf('/reports/me.pdf', filters, 'mi-historial.pdf');
  },
};
