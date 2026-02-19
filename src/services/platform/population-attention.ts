import { apiClient } from '@/lib/client';
import type { PaginatedResponse } from '@/lib/client';

export interface PopulationAttention {
  id: number;
  usuario?: number;
  asunto: string;
  descripcion: string;
  estado?: string;
  respuesta?: string;
  fecha?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreatePopulationAttentionData {
  asunto: string;
  descripcion: string;
  estado?: string;
}

export interface UpdatePopulationAttentionData extends Partial<CreatePopulationAttentionData> {
  respuesta?: string;
}

// Endpoints de atención a la población
// NOTA: El endpoint /v1/atencion_poblacion/ no existe en el backend
const POPULATION_ATTENTION_ENDPOINTS = {
  REQUESTS: '/v1/population-attention/',
} as const;

class PopulationAttentionService {
  async getRequests(
    page = 1,
    pageSize = 10
  ): Promise<PaginatedResponse<PopulationAttention>> {
    const params = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString(),
    });

    const response = await apiClient.get<PaginatedResponse<PopulationAttention>>(
      `${POPULATION_ATTENTION_ENDPOINTS.REQUESTS}?${params}`
    );

    return response;
  }

  async getRequestById(id: number): Promise<PopulationAttention> {
    const response = await apiClient.get<PopulationAttention>(
      `${POPULATION_ATTENTION_ENDPOINTS.REQUESTS}${id}/`
    );

    return response;
  }

  async createRequest(data: CreatePopulationAttentionData): Promise<PopulationAttention> {
    const response = await apiClient.post<PopulationAttention>(
      POPULATION_ATTENTION_ENDPOINTS.REQUESTS,
      data
    );

    return response;
  }

  async updateRequest(id: number, data: UpdatePopulationAttentionData): Promise<PopulationAttention> {
    const response = await apiClient.patch<PopulationAttention>(
      `${POPULATION_ATTENTION_ENDPOINTS.REQUESTS}${id}/`,
      data
    );

    return response;
  }

  async deleteRequest(id: number): Promise<void> {
    await apiClient.delete(`${POPULATION_ATTENTION_ENDPOINTS.REQUESTS}${id}/`);
  }
}

export const populationAttentionService = new PopulationAttentionService();
export default populationAttentionService;
