import apiClient from '@/lib/api-client';
import type {
  LocalListItem,
  LocalDetail,
  LocalCreate,
  LocalUpdate,
  LocalStatistics,
  AvailabilityCheck,
  AvailabilityResult,
  CalendarEntry,
  ReservationListItem,
  ReservationDetail,
  ReservationCreate,
  ReservationUpdate,
  ReservationHistoryItem,
  ApproveReservationData,
  RejectReservationData,
  CancelReservationData,
  PaginatedResponse,
  GetLocalsParams,
  GetReservationsParams,
  GetLocalReservationsParams,
} from '@/types/locals.types';

const BASE = '/labs';

export const localsService = {
  // --- Locals ---

  async getLocals(params?: GetLocalsParams): Promise<PaginatedResponse<LocalListItem>> {
    const response = await apiClient.get<PaginatedResponse<LocalListItem>>(`${BASE}/locals/`, {
      params,
    });
    return response.data;
  },

  async getLocal(id: number): Promise<LocalDetail> {
    const response = await apiClient.get<LocalDetail>(`${BASE}/locals/${id}/`);
    return response.data;
  },

  async createLocal(data: LocalCreate): Promise<LocalDetail> {
    const response = await apiClient.post<LocalDetail>(`${BASE}/locals/`, data);
    return response.data;
  },

  async updateLocal(id: number, data: LocalUpdate): Promise<LocalDetail> {
    const response = await apiClient.patch<LocalDetail>(`${BASE}/locals/${id}/`, data);
    return response.data;
  },

  async deleteLocal(id: number): Promise<void> {
    await apiClient.delete(`${BASE}/locals/${id}/`);
  },

  async getActiveLocals(): Promise<LocalListItem[]> {
    const response = await apiClient.get<LocalListItem[]>(`${BASE}/locals/active/`);
    return response.data;
  },

  async checkAvailability(localId: number, data: AvailabilityCheck): Promise<AvailabilityResult> {
    const response = await apiClient.post<AvailabilityResult>(
      `${BASE}/locals/${localId}/availability/`,
      data
    );
    return response.data;
  },

  async getLocalReservations(
    localId: number,
    params?: GetLocalReservationsParams
  ): Promise<PaginatedResponse<ReservationListItem>> {
    const response = await apiClient.get<PaginatedResponse<ReservationListItem>>(
      `${BASE}/locals/${localId}/reservations/`,
      { params }
    );
    return response.data;
  },

  async getLocalStatistics(localId: number): Promise<LocalStatistics> {
    const response = await apiClient.get<LocalStatistics>(
      `${BASE}/locals/${localId}/statistics/`
    );
    return response.data;
  },

  async getLocalCalendar(localId: number, month: string): Promise<CalendarEntry[]> {
    const response = await apiClient.get<CalendarEntry[]>(
      `${BASE}/locals/${localId}/calendar/`,
      { params: { month } }
    );
    return response.data;
  },

  // --- Reservations ---

  async getReservations(
    params?: GetReservationsParams
  ): Promise<PaginatedResponse<ReservationListItem>> {
    const response = await apiClient.get<PaginatedResponse<ReservationListItem>>(
      `${BASE}/reservations/`,
      { params }
    );
    return response.data;
  },

  async getReservation(id: number): Promise<ReservationDetail> {
    const response = await apiClient.get<ReservationDetail>(`${BASE}/reservations/${id}/`);
    return response.data;
  },

  async createReservation(data: ReservationCreate): Promise<ReservationDetail> {
    const response = await apiClient.post<ReservationDetail>(`${BASE}/reservations/`, data);
    return response.data;
  },

  async updateReservation(id: number, data: ReservationUpdate): Promise<ReservationDetail> {
    const response = await apiClient.patch<ReservationDetail>(
      `${BASE}/reservations/${id}/`,
      data
    );
    return response.data;
  },

  async deleteReservation(id: number): Promise<void> {
    await apiClient.delete(`${BASE}/reservations/${id}/`);
  },

  async getMyReservations(): Promise<ReservationListItem[]> {
    const response = await apiClient.get<ReservationListItem[]>(
      `${BASE}/reservations/my_reservations/`
    );
    return response.data;
  },

  async getPendingReservations(): Promise<ReservationListItem[]> {
    const response = await apiClient.get<ReservationListItem[]>(
      `${BASE}/reservations/pending/`
    );
    return response.data;
  },

  async getUpcomingReservations(): Promise<ReservationListItem[]> {
    const response = await apiClient.get<ReservationListItem[]>(
      `${BASE}/reservations/upcoming/`
    );
    return response.data;
  },

  async getActiveReservations(): Promise<ReservationListItem[]> {
    const response = await apiClient.get<ReservationListItem[]>(
      `${BASE}/reservations/active/`
    );
    return response.data;
  },

  async submitReservation(id: number): Promise<ReservationDetail> {
    const response = await apiClient.post<ReservationDetail>(
      `${BASE}/reservations/${id}/submit/`
    );
    return response.data;
  },

  async approveReservation(
    id: number,
    data?: ApproveReservationData
  ): Promise<ReservationDetail> {
    const response = await apiClient.post<ReservationDetail>(
      `${BASE}/reservations/${id}/approve/`,
      data ?? {}
    );
    return response.data;
  },

  async rejectReservation(id: number, data: RejectReservationData): Promise<ReservationDetail> {
    const response = await apiClient.post<ReservationDetail>(
      `${BASE}/reservations/${id}/reject/`,
      data
    );
    return response.data;
  },

  async cancelReservation(id: number, data: CancelReservationData): Promise<ReservationDetail> {
    const response = await apiClient.post<ReservationDetail>(
      `${BASE}/reservations/${id}/cancel/`,
      data
    );
    return response.data;
  },

  async getReservationHistory(id: number): Promise<ReservationHistoryItem[]> {
    const response = await apiClient.get<ReservationHistoryItem[]>(
      `${BASE}/reservations/${id}/history/`
    );
    return response.data;
  },
};
