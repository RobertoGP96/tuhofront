import type { PaginatedResponse } from '@/lib/client';
import { apiClient } from '@/lib/client';

export const ProcedureState = {
  PENDING: 'PENDIENTE',
  IN_PROGRESS: 'EN_PROCESO',
  APPROVED: 'APROBADO',
  REJECTED: 'RECHAZADO',
  COMPLETED: 'COMPLETADO',
  DRAFT: 'BORRADOR',
  SENT: 'ENVIADO',
  REQUIRES_INFO: 'REQUIERE_INFO',
  FINALIZED: 'FINALIZADO',
} as const;

export type ProcedureStateType = typeof ProcedureState[keyof typeof ProcedureState];

export interface ProcedureBase {
  id: number;
  numero_seguimiento: string;
  user: number;
  state: ProcedureStateType;
  observation?: string;
  created_at: string;
  updated_at: string;
  deadline?: string;
}

export interface ProcedureListItem extends ProcedureBase {
  user_username?: string;
  user_email?: string;
}

export interface ProcedureDetail extends ProcedureBase {
  user_detail?: {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
  };
}

export interface ProcedureStats {
  total: number;
  pendiente: number;
  en_proceso: number;
  aprobado: number;
  rechazado: number;
  completado: number;
}

export interface ProcedureType {
  id: number;
  name: string;
  description?: string;
}

export interface ProcedureFilterOptions {
  page?: number;
  page_size?: number;
  search?: string;
  state?: string;
  user_id?: number;
}

export interface CreateProcedureData {
  procedure_type?: number;
  observation?: string;
  deadline?: string;
}

export interface UpdateProcedureData extends Partial<CreateProcedureData> {}

const PROCEDURE_ENDPOINTS = {
  PROCEDURES: '/v1/procedures/',
  TYPES: '/v1/procedures/types/',
  STATS: '/v1/procedures/stats/',
  MY_PROCEDURES: '/v1/procedures/my_procedures/',
} as const;

class PlatformProcedureService {
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

  async getProcedureById(id: string): Promise<ProcedureDetail> {
    const response = await apiClient.get<ProcedureDetail>(
      `${PROCEDURE_ENDPOINTS.PROCEDURES}${id}/`
    );

    return response;
  }

  async createProcedure(data: CreateProcedureData): Promise<ProcedureDetail> {
    const formData = new FormData();
    
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

  async updateProcedure(id: string, data: UpdateProcedureData): Promise<ProcedureDetail> {
    const response = await apiClient.patch<ProcedureDetail>(
      `${PROCEDURE_ENDPOINTS.PROCEDURES}${id}/`,
      data
    );

    return response;
  }

  async deleteProcedure(id: string): Promise<void> {
    await apiClient.delete(`${PROCEDURE_ENDPOINTS.PROCEDURES}${id}/`);
  }

  async getProcedureTypes(): Promise<ProcedureType[]> {
    const response = await apiClient.get<ProcedureType[]>(PROCEDURE_ENDPOINTS.TYPES);
    return response;
  }

  async getProcedureStats(): Promise<ProcedureStats> {
    const response = await apiClient.get<ProcedureStats>(PROCEDURE_ENDPOINTS.STATS);
    return response;
  }

  async submitProcedure(id: string): Promise<ProcedureDetail> {
    const response = await apiClient.post<ProcedureDetail>(
      `${PROCEDURE_ENDPOINTS.PROCEDURES}${id}/submit/`
    );
    return response;
  }

  async approveProcedure(id: string): Promise<ProcedureDetail> {
    const response = await apiClient.post<ProcedureDetail>(
      `${PROCEDURE_ENDPOINTS.PROCEDURES}${id}/approve/`
    );
    return response;
  }

  async transitionState(id: string, state: string, observation?: string): Promise<ProcedureDetail> {
    const response = await apiClient.post<ProcedureDetail>(
      `${PROCEDURE_ENDPOINTS.PROCEDURES}${id}/`,
      { state, observation }
    );
    return response;
  }
}

export const platformProcedureService = new PlatformProcedureService();
export default platformProcedureService;
