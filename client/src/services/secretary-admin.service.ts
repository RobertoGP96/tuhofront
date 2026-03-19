import apiClient from '../lib/api-client';
import type { SecretaryDocProcedure, ProcedureListResponse } from '../types/secretary-doc.types';

const BASE_URL = '/tramites-secretaria';

export interface SecretaryStats {
  total_tramites: number;
  por_estado: { state: string; total: number }[];
  por_tipo_estudio: { study_type: string; total: number }[];
  tramites_ultimos_30_dias: number;
}

export interface GetProceduresParams {
  page?: number;
  page_size?: number;
  study_type?: string;
  visibility_type?: string;
  state?: string;
  search?: string;
  ordering?: string;
}

export interface ChangeStateData {
  estado: string;
  observaciones?: string;
}

export const secretaryAdminService = {
  async getStats(): Promise<SecretaryStats> {
    const response = await apiClient.get<SecretaryStats>(`${BASE_URL}/estadisticas/`);
    return response.data;
  },

  async getProcedures(
    params?: GetProceduresParams,
  ): Promise<ProcedureListResponse<SecretaryDocProcedure>> {
    const response = await apiClient.get<ProcedureListResponse<SecretaryDocProcedure>>(
      `${BASE_URL}/tramites/`,
      { params },
    );
    return response.data;
  },

  async getProcedure(id: number): Promise<SecretaryDocProcedure> {
    const response = await apiClient.get<SecretaryDocProcedure>(
      `${BASE_URL}/tramites/${id}/`,
    );
    return response.data;
  },

  async updateProcedure(
    id: number,
    data: Partial<SecretaryDocProcedure>,
  ): Promise<SecretaryDocProcedure> {
    const response = await apiClient.patch<SecretaryDocProcedure>(
      `${BASE_URL}/tramites/${id}/`,
      data,
    );
    return response.data;
  },

  async changeState(id: number, data: ChangeStateData): Promise<void> {
    await apiClient.post(`${BASE_URL}/tramites/${id}/cambiar_estado/`, { estado: data.estado });
  },
};
