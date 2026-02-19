import { apiClient } from '@/lib/client';
import type { PaginatedResponse } from '@/lib/client';

export interface ProcedureStatus {
  id: number;
  nombre: string;
  descripcion?: string;
  color?: string;
  orden?: number;
  created_at?: string;
  updated_at?: string;
}

export interface CreateProcedureStatusData {
  nombre: string;
  descripcion?: string;
  color?: string;
  orden?: number;
}

export interface UpdateProcedureStatusData extends Partial<CreateProcedureStatusData> {}

// Endpoints de estados de trámites
// NOTA: El endpoint /v1/estados-tramites/ no existe en el backend
// Este servicio es un placeholder
const PROCEDURE_STATUS_ENDPOINTS = {
  STATUSES: '/v1/procedures/status/',
} as const;

class ProcedureStatusService {
  async getStatuses(
    page = 1,
    pageSize = 50
  ): Promise<PaginatedResponse<ProcedureStatus>> {
    const params = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString(),
    });

    const response = await apiClient.get<PaginatedResponse<ProcedureStatus>>(
      `${PROCEDURE_STATUS_ENDPOINTS.STATUSES}?${params}`
    );

    return response;
  }

  async getStatusById(id: number): Promise<ProcedureStatus> {
    const response = await apiClient.get<ProcedureStatus>(
      `${PROCEDURE_STATUS_ENDPOINTS.STATUSES}${id}/`
    );

    return response;
  }

  async createStatus(data: CreateProcedureStatusData): Promise<ProcedureStatus> {
    const response = await apiClient.post<ProcedureStatus>(
      PROCEDURE_STATUS_ENDPOINTS.STATUSES,
      data
    );

    return response;
  }

  async updateStatus(id: number, data: UpdateProcedureStatusData): Promise<ProcedureStatus> {
    const response = await apiClient.patch<ProcedureStatus>(
      `${PROCEDURE_STATUS_ENDPOINTS.STATUSES}${id}/`,
      data
    );

    return response;
  }

  async deleteStatus(id: number): Promise<void> {
    await apiClient.delete(`${PROCEDURE_STATUS_ENDPOINTS.STATUSES}${id}/`);
  }
}

export const procedureStatusService = new ProcedureStatusService();
export default procedureStatusService;
