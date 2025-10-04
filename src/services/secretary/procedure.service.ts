import { apiClient } from '../api';
import type {
  Procedure,
  ProcedureType,
  CreateProcedureData,
  UpdateProcedureData,
  ProcedureFilters,
  ProcedureStats
} from '../../types/sec-doc/procedures';
import type { ApiResponse, PaginatedResponse } from '../api/client';

// Endpoints de trámites
const PROCEDURE_ENDPOINTS = {
  PROCEDURES: '/secretary/procedures/',
  PROCEDURE_TYPES: '/secretary/procedure-types/',
  PROCEDURE_STATS: '/secretary/stats/',
  PROCEDURE_DOCUMENTS: '/secretary/procedures/:id/documents/',
  PROCEDURE_HISTORY: '/secretary/procedures/:id/history/',
} as const;

class ProcedureService {
  /**
   * Obtener lista de trámites con filtros y paginación
   */
  async getProcedures(
    filters?: ProcedureFilters,
    page = 1,
    pageSize = 10
  ): Promise<PaginatedResponse<Procedure>> {
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

    const response = await apiClient.get<ApiResponse<PaginatedResponse<Procedure>>>(
      `${PROCEDURE_ENDPOINTS.PROCEDURES}?${params}`
    );

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.message || 'Error al obtener trámites');
  }

  /**
   * Obtener un trámite por ID
   */
  async getProcedureById(id: number): Promise<Procedure> {
    const response = await apiClient.get<ApiResponse<Procedure>>(
      `${PROCEDURE_ENDPOINTS.PROCEDURES}${id}/`
    );

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.message || 'Error al obtener trámite');
  }

  /**
   * Crear un nuevo trámite
   */
  async createProcedure(data: CreateProcedureData): Promise<Procedure> {
    let response: ApiResponse<Procedure>;

    if (data.documents && data.documents.length > 0) {
      // Si hay documentos, usar FormData
      const formData = new FormData();
      formData.append('procedure_type_id', data.procedure_type_id.toString());
      if (data.notes) {
        formData.append('notes', data.notes);
      }
      
      data.documents.forEach((file, index) => {
        formData.append(`document_${index}`, file);
      });

      response = await apiClient.upload<ApiResponse<Procedure>>(
        PROCEDURE_ENDPOINTS.PROCEDURES,
        formData
      );
    } else {
      // Sin documentos, usar JSON
      response = await apiClient.post<ApiResponse<Procedure>>(
        PROCEDURE_ENDPOINTS.PROCEDURES,
        {
          procedure_type_id: data.procedure_type_id,
          notes: data.notes,
        }
      );
    }

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.message || 'Error al crear trámite');
  }

  /**
   * Actualizar un trámite
   */
  async updateProcedure(id: number, data: UpdateProcedureData): Promise<Procedure> {
    const response = await apiClient.patch<ApiResponse<Procedure>>(
      `${PROCEDURE_ENDPOINTS.PROCEDURES}${id}/`,
      data
    );

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.message || 'Error al actualizar trámite');
  }

  /**
   * Eliminar un trámite
   */
  async deleteProcedure(id: number): Promise<void> {
    const response = await apiClient.delete<ApiResponse<null>>(
      `${PROCEDURE_ENDPOINTS.PROCEDURES}${id}/`
    );

    if (!response.success) {
      throw new Error(response.message || 'Error al eliminar trámite');
    }
  }

  /**
   * Obtener tipos de trámites disponibles
   */
  async getProcedureTypes(): Promise<ProcedureType[]> {
    const response = await apiClient.get<ApiResponse<ProcedureType[]>>(
      PROCEDURE_ENDPOINTS.PROCEDURE_TYPES
    );

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.message || 'Error al obtener tipos de trámites');
  }

  /**
   * Obtener estadísticas de trámites
   */
  async getProcedureStats(): Promise<ProcedureStats> {
    const response = await apiClient.get<ApiResponse<ProcedureStats>>(
      PROCEDURE_ENDPOINTS.PROCEDURE_STATS
    );

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.message || 'Error al obtener estadísticas');
  }

  /**
   * Subir documento adicional a un trámite
   */
  async uploadDocument(procedureId: number, file: File, name?: string): Promise<void> {
    const formData = new FormData();
    formData.append('file', file);
    if (name) {
      formData.append('name', name);
    }

    const endpoint = PROCEDURE_ENDPOINTS.PROCEDURE_DOCUMENTS.replace(':id', procedureId.toString());
    const response = await apiClient.upload<ApiResponse<null>>(endpoint, formData);

    if (!response.success) {
      throw new Error(response.message || 'Error al subir documento');
    }
  }

  /**
   * Eliminar documento de un trámite
   */
  async deleteDocument(procedureId: number, documentId: number): Promise<void> {
    const endpoint = PROCEDURE_ENDPOINTS.PROCEDURE_DOCUMENTS.replace(':id', procedureId.toString());
    const response = await apiClient.delete<ApiResponse<null>>(
      `${endpoint}${documentId}/`
    );

    if (!response.success) {
      throw new Error(response.message || 'Error al eliminar documento');
    }
  }

  /**
   * Obtener historial de cambios de un trámite
   */
  async getProcedureHistory(procedureId: number): Promise<any[]> {
    const endpoint = PROCEDURE_ENDPOINTS.PROCEDURE_HISTORY.replace(':id', procedureId.toString());
    const response = await apiClient.get<ApiResponse<any[]>>(endpoint);

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.message || 'Error al obtener historial');
  }

  /**
   * Buscar trámites por número de seguimiento
   */
  async searchByTrackingNumber(trackingNumber: string): Promise<Procedure | null> {
    const response = await apiClient.get<ApiResponse<Procedure>>(
      `${PROCEDURE_ENDPOINTS.PROCEDURES}search/?tracking_number=${trackingNumber}`
    );

    if (response.success && response.data) {
      return response.data;
    }

    return null;
  }

  /**
   * Obtener trámites del usuario actual
   */
  async getMyProcedures(page = 1, pageSize = 10): Promise<PaginatedResponse<Procedure>> {
    const params = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString(),
      my_procedures: 'true',
    });

    const response = await apiClient.get<ApiResponse<PaginatedResponse<Procedure>>>(
      `${PROCEDURE_ENDPOINTS.PROCEDURES}?${params}`
    );

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.message || 'Error al obtener mis trámites');
  }
}

// Instancia singleton del servicio de trámites
export const procedureService = new ProcedureService();

// Export default para compatibilidad
export default procedureService;