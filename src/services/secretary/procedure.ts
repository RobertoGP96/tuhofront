import { apiClient } from '../api';
import type { SecretaryProcedure } from '../../types/sec-doc/procedures';
import type { PaginatedResponse } from '../api/client';

// Endpoints de trámites
const PROCEDURE_ENDPOINTS = {
  PROCEDURES: '/v1/tramites-secretaria/',
} as const;

class ProcedureService {
  /**
   * Obtener lista de trámites con filtros y paginación
   */
  async getProcedures(
    filters?: Record<string, any>,
    page = 1,
    pageSize = 10
  ): Promise<PaginatedResponse<SecretaryProcedure>> {
    const params = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString(),
    });

    // Agregar filtros si existen
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });
    }

    const response = await apiClient.get<PaginatedResponse<SecretaryProcedure>>(
      `${PROCEDURE_ENDPOINTS.PROCEDURES}?${params}`
    );

    return response;
  }

  /**
   * Obtener un trámite por ID
   */
  async getProcedureById(id: number): Promise<SecretaryProcedure> {
    const response = await apiClient.get<SecretaryProcedure>(
      `${PROCEDURE_ENDPOINTS.PROCEDURES}${id}/`
    );

    return response;
  }

  /**
   * Crear un nuevo trámite
   */
  async createProcedure(data: Partial<SecretaryProcedure>): Promise<SecretaryProcedure> {
    const response = await apiClient.post<SecretaryProcedure>(
      PROCEDURE_ENDPOINTS.PROCEDURES,
      data
    );

    return response;
  }

  /**
   * Actualizar un trámite
   */
  async updateProcedure(id: number, data: Partial<SecretaryProcedure>): Promise<SecretaryProcedure> {
    const response = await apiClient.patch<SecretaryProcedure>(
      `${PROCEDURE_ENDPOINTS.PROCEDURES}${id}/`,
      data
    );

    return response;
  }

  /**
   * Eliminar un trámite
   */
  async deleteProcedure(id: number): Promise<void> {
    await apiClient.delete(`${PROCEDURE_ENDPOINTS.PROCEDURES}${id}/`);
  }

  /**
   * Obtener trámites del usuario actual
   */
  async getMyProcedures(page = 1, pageSize = 10): Promise<PaginatedResponse<SecretaryProcedure>> {
    return this.getProcedures(undefined, page, pageSize);
  }
}

// Instancia singleton del servicio de trámites
export const procedureService = new ProcedureService();

// Export default para compatibilidad
export default procedureService;