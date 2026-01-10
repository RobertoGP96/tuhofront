import type { PaginatedResponse } from '@/lib/client';
import { apiClient } from '@/lib/client';
import type {
    CreateProcedureData,
    ProcedureDetail,
    ProcedureFilterOptions,
    ProcedureListItem,
    ProcedureStats,
    ProcedureType,
    UpdateProcedureData
} from '@/types/procedure';

const PROCEDURE_ENDPOINTS = {
  PROCEDURES: '/v1/procedures/',
  TYPES: '/v1/procedures/types/',
  STATS: '/v1/procedures/stats/',
  MY_PROCEDURES: '/v1/procedures/my/',
} as const;

class PlatformProcedureService {
  /**
   * Get paginated list of procedures with filters
   */
  async getProcedures(
    filters?: ProcedureFilterOptions
  ): Promise<PaginatedResponse<ProcedureListItem>> {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach(v => params.append(key, v.toString()));
          } else {
            params.append(key, value.toString());
          }
        }
      });
    }

    const response = await apiClient.get<PaginatedResponse<ProcedureListItem>>(
      `${PROCEDURE_ENDPOINTS.PROCEDURES}?${params}`
    );

    return response;
  }

  /**
   * Get current user's procedures
   */
  async getMyProcedures(
    filters?: ProcedureFilterOptions
  ): Promise<PaginatedResponse<ProcedureListItem>> {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }

    const response = await apiClient.get<PaginatedResponse<ProcedureListItem>>(
      `${PROCEDURE_ENDPOINTS.MY_PROCEDURES}?${params}`
    );

    return response;
  }

  /**
   * Get a procedure by ID with full details
   */
  async getProcedureById(id: string): Promise<ProcedureDetail> {
    const response = await apiClient.get<ProcedureDetail>(
      `${PROCEDURE_ENDPOINTS.PROCEDURES}${id}/`
    );

    return response;
  }

  /**
   * Create a new procedure
   */
  async createProcedure(data: CreateProcedureData): Promise<ProcedureDetail> {
    const formData = new FormData();
    
    // Append fields
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (key === 'documents' && Array.isArray(value)) {
          value.forEach((file) => formData.append('documents', file));
        } else if (key === 'metadata') {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, value as string);
        }
      }
    });

    const response = await apiClient.post<ProcedureDetail>(
      PROCEDURE_ENDPOINTS.PROCEDURES,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return response;
  }

  /**
   * Update an existing procedure
   */
  async updateProcedure(id: string, data: UpdateProcedureData): Promise<ProcedureDetail> {
    const response = await apiClient.patch<ProcedureDetail>(
      `${PROCEDURE_ENDPOINTS.PROCEDURES}${id}/`,
      data
    );

    return response;
  }

  /**
   * Delete a procedure
   */
  async deleteProcedure(id: string): Promise<void> {
    await apiClient.delete(`${PROCEDURE_ENDPOINTS.PROCEDURES}${id}/`);
  }

  /**
   * Get procedure types
   */
  async getProcedureTypes(): Promise<ProcedureType[]> {
    const response = await apiClient.get<ProcedureType[]>(PROCEDURE_ENDPOINTS.TYPES);
    return response;
  }

  /**
   * Get procedure statistics
   */
  async getProcedureStats(): Promise<ProcedureStats> {
    const response = await apiClient.get<ProcedureStats>(PROCEDURE_ENDPOINTS.STATS);
    return response;
  }

  /**
   * Transition procedure to a new state
   */
  async transitionState(id: string, state: string, observation?: string): Promise<ProcedureDetail> {
    const response = await apiClient.post<ProcedureDetail>(
      `${PROCEDURE_ENDPOINTS.PROCEDURES}${id}/transition/`,
      { state, observation }
    );
    return response;
  }
}

export const platformProcedureService = new PlatformProcedureService();
export default platformProcedureService;
