import apiClient from '@/lib/api-client';
import type {
  AdminFeedingProcedure,
  AdminAccommodationProcedure,
  AdminTransportProcedure,
  AdminMaintenanceProcedure,
  AdminProcedureUpdatePayload,
  InternalNoteCreatePayload,
  InternalStats,
  ProcedureListResponse,
} from '@/types/internal.types';

const BASE = '/internal';

export type ProcedureListParams = {
  page?: number;
  state?: string;
  page_size?: number;
};

export const internalAdminService = {
  // --- Feeding ---
  async getFeedingProcedures(
    params?: ProcedureListParams,
  ): Promise<ProcedureListResponse<AdminFeedingProcedure>> {
    const res = await apiClient.get<ProcedureListResponse<AdminFeedingProcedure>>(
      `${BASE}/feeding-procedures/`,
      { params },
    );
    return res.data;
  },

  async updateFeedingProcedure(
    id: number,
    data: AdminProcedureUpdatePayload,
  ): Promise<AdminFeedingProcedure> {
    const res = await apiClient.patch<AdminFeedingProcedure>(
      `${BASE}/feeding-procedures/${id}/`,
      data,
    );
    return res.data;
  },

  // --- Accommodation ---
  async getAccommodationProcedures(
    params?: ProcedureListParams,
  ): Promise<ProcedureListResponse<AdminAccommodationProcedure>> {
    const res = await apiClient.get<ProcedureListResponse<AdminAccommodationProcedure>>(
      `${BASE}/accommodation-procedures/`,
      { params },
    );
    return res.data;
  },

  async updateAccommodationProcedure(
    id: number,
    data: AdminProcedureUpdatePayload,
  ): Promise<AdminAccommodationProcedure> {
    const res = await apiClient.patch<AdminAccommodationProcedure>(
      `${BASE}/accommodation-procedures/${id}/`,
      data,
    );
    return res.data;
  },

  // --- Transport ---
  async getTransportProcedures(
    params?: ProcedureListParams,
  ): Promise<ProcedureListResponse<AdminTransportProcedure>> {
    const res = await apiClient.get<ProcedureListResponse<AdminTransportProcedure>>(
      `${BASE}/transport-procedures/`,
      { params },
    );
    return res.data;
  },

  async updateTransportProcedure(
    id: number,
    data: AdminProcedureUpdatePayload,
  ): Promise<AdminTransportProcedure> {
    const res = await apiClient.patch<AdminTransportProcedure>(
      `${BASE}/transport-procedures/${id}/`,
      data,
    );
    return res.data;
  },

  // --- Maintenance (note: "maintance" typo in API URL) ---
  async getMaintenanceProcedures(
    params?: ProcedureListParams,
  ): Promise<ProcedureListResponse<AdminMaintenanceProcedure>> {
    const res = await apiClient.get<ProcedureListResponse<AdminMaintenanceProcedure>>(
      `${BASE}/maintance-procedures/`,
      { params },
    );
    return res.data;
  },

  async updateMaintenanceProcedure(
    id: number,
    data: AdminProcedureUpdatePayload,
  ): Promise<AdminMaintenanceProcedure> {
    const res = await apiClient.patch<AdminMaintenanceProcedure>(
      `${BASE}/maintance-procedures/${id}/`,
      data,
    );
    return res.data;
  },

  // --- Stats ---
  async getInternalStats(type?: string): Promise<InternalStats> {
    const res = await apiClient.get<InternalStats>(`${BASE}/stats/`, {
      params: type ? { type } : undefined,
    });
    return res.data;
  },

  // --- Notes ---
  async createNote(payload: InternalNoteCreatePayload): Promise<void> {
    await apiClient.post(`${BASE}/notes/`, payload);
  },
};
