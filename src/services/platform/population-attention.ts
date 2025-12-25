import { apiClient } from '../api';
import type { PaginatedResponse } from '../api/client';

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
const POPULATION_ATTENTION_ENDPOINTS = {
  REQUESTS: '/v1/atencion_poblacion/',
} as const;

class PopulationAttentionService {
  /**
   * Obtener lista de solicitudes de atención
   */
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

  /**
   * Obtener una solicitud por ID
   */
  async getRequestById(id: number): Promise<PopulationAttention> {
    const response = await apiClient.get<PopulationAttention>(
      `${POPULATION_ATTENTION_ENDPOINTS.REQUESTS}${id}/`
    );

    return response;
  }

  /**
   * Crear una nueva solicitud
   */
  async createRequest(data: CreatePopulationAttentionData): Promise<PopulationAttention> {
    const response = await apiClient.post<PopulationAttention>(
      POPULATION_ATTENTION_ENDPOINTS.REQUESTS,
      data
    );

    return response;
  }

  /**
   * Actualizar una solicitud
   */
  async updateRequest(id: number, data: UpdatePopulationAttentionData): Promise<PopulationAttention> {
    const response = await apiClient.patch<PopulationAttention>(
      `${POPULATION_ATTENTION_ENDPOINTS.REQUESTS}${id}/`,
      data
    );

    return response;
  }

  /**
   * Eliminar una solicitud
   */
  async deleteRequest(id: number): Promise<void> {
    await apiClient.delete(`${POPULATION_ATTENTION_ENDPOINTS.REQUESTS}${id}/`);
  }
}

// Instancia singleton del servicio de atención a la población
export const populationAttentionService = new PopulationAttentionService();

// Export default para compatibilidad
export default populationAttentionService;

