import apiClient from '../lib/api-client';
import type { Procedure, ProcedureNote, PaginatedResponse, ProcedureState } from '../types/procedures.types';

export interface GetProceduresParams {
  state?: string;
  follow_number?: string;
  page?: number;
}

export interface UpdateProcedureData {
  state?: ProcedureState;
  observation?: string;
}

export interface CreateNoteData {
  procedure: string;
  content: string;
}

export const proceduresService = {
  async getProcedures(params?: GetProceduresParams): Promise<PaginatedResponse<Procedure>> {
    const response = await apiClient.get<PaginatedResponse<Procedure>>('/procedures/', {
      params,
    });
    return response.data;
  },

  async getProcedure(id: string): Promise<Procedure> {
    const response = await apiClient.get<Procedure>(`/procedures/${id}/`);
    return response.data;
  },

  async updateProcedure(id: string, data: UpdateProcedureData): Promise<Procedure> {
    const response = await apiClient.patch<Procedure>(`/procedures/${id}/`, data);
    return response.data;
  },

  async getProcedureNotes(procedureId: string): Promise<PaginatedResponse<ProcedureNote>> {
    const response = await apiClient.get<PaginatedResponse<ProcedureNote>>('/internal/notes/', {
      params: { procedure: procedureId },
    });
    return response.data;
  },

  async createNote(data: CreateNoteData): Promise<ProcedureNote> {
    const response = await apiClient.post<ProcedureNote>('/internal/notes/', data);
    return response.data;
  },
};
