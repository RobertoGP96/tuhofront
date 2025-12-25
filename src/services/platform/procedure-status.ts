import { apiClient } from '../api';
import type { PaginatedResponse } from '../api/client';

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
const PROCEDURE_STATUS_ENDPOINTS = {
  STATUSES: '/v1/estados-tramites/',
} as const;

class ProcedureStatusService {
  /**
   * Obtener lista de estados de trámites
   */
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

  /**
   * Obtener un estado por ID
   */
  async getStatusById(id: number): Promise<ProcedureStatus> {
    const response = await apiClient.get<ProcedureStatus>(
      `${PROCEDURE_STATUS_ENDPOINTS.STATUSES}${id}/`
    );

    return response;
  }

  /**
   * Crear un nuevo estado
   */
  async createStatus(data: CreateProcedureStatusData): Promise<ProcedureStatus> {
    const response = await apiClient.post<ProcedureStatus>(
      PROCEDURE_STATUS_ENDPOINTS.STATUSES,
      data
    );

    return response;
  }

  /**
   * Actualizar un estado
   */
  async updateStatus(id: number, data: UpdateProcedureStatusData): Promise<ProcedureStatus> {
    const response = await apiClient.patch<ProcedureStatus>(
      `${PROCEDURE_STATUS_ENDPOINTS.STATUSES}${id}/`,
      data
    );

    return response;
  }

  /**
   * Eliminar un estado
   */
  async deleteStatus(id: number): Promise<void> {
    await apiClient.delete(`${PROCEDURE_STATUS_ENDPOINTS.STATUSES}${id}/`);
  }
}

// Instancia singleton del servicio de estados
export const procedureStatusService = new ProcedureStatusService();

// Export default para compatibilidad
export default procedureStatusService;

