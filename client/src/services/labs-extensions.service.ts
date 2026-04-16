import apiClient from '../lib/api-client';

export interface Equipment {
  id: string;
  code: string;
  name: string;
  category: 'AUDIO' | 'VIDEO' | 'COMPUTING' | 'FURNITURE' | 'OTHER';
  description: string;
  is_active: boolean;
}

export interface LocalEquipment {
  id: string;
  local: string;
  equipment: string;
  equipment_name: string;
  quantity: number;
  notes: string;
  operational: boolean;
}

export interface ReservationSeries {
  id: string;
  local: string;
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  interval: number;
  weekdays: string;
  start_date: string;
  end_date: string;
  start_time: string;
  end_time: string;
  purpose: string;
  purpose_detail: string;
  expected_attendees: number;
  responsible_name: string;
  responsible_phone: string;
  responsible_email: string;
  created_at: string;
}

export interface CheckInRecord {
  id: string;
  reservation: string;
  checked_in_at: string | null;
  checked_out_at: string | null;
  attendance_count: number | null;
  notes: string;
}

export const labsExtensionsService = {
  // Equipment catalog
  async listEquipment(): Promise<Equipment[]> {
    const { data } = await apiClient.get<{ results: Equipment[] } | Equipment[]>('/labs/equipment/');
    return Array.isArray(data) ? data : data.results;
  },

  // Local equipment inventory
  async listLocalEquipment(localId?: string): Promise<LocalEquipment[]> {
    const { data } = await apiClient.get<{ results: LocalEquipment[] } | LocalEquipment[]>(
      '/labs/local-equipment/',
      { params: localId ? { local: localId } : undefined },
    );
    return Array.isArray(data) ? data : data.results;
  },

  async addLocalEquipment(payload: Partial<LocalEquipment>): Promise<LocalEquipment> {
    const { data } = await apiClient.post<LocalEquipment>('/labs/local-equipment/', payload);
    return data;
  },

  // Reservation series
  async createSeries(payload: Partial<ReservationSeries>): Promise<ReservationSeries> {
    const { data } = await apiClient.post<ReservationSeries>('/labs/series/', payload);
    return data;
  },

  async expandSeries(seriesId: string): Promise<{ created: string[]; skipped: unknown[] }> {
    const { data } = await apiClient.post<{ created: string[]; skipped: unknown[] }>(
      `/labs/series/${seriesId}/expand/`,
    );
    return data;
  },

  // Check-in / Check-out
  async checkIn(reservationId: string): Promise<CheckInRecord> {
    const { data } = await apiClient.post<CheckInRecord>(`/labs/checkin/check-in/${reservationId}/`);
    return data;
  },

  async checkOut(
    reservationId: string,
    payload: { attendance_count?: number; notes?: string },
  ): Promise<CheckInRecord> {
    const { data } = await apiClient.post<CheckInRecord>(
      `/labs/checkin/check-out/${reservationId}/`,
      payload,
    );
    return data;
  },

  icalUrl(reservationId: string): string {
    const baseUrl = (import.meta as unknown as { env: Record<string, string> }).env?.VITE_API_URL || '/api/v1';
    return `${baseUrl}/labs/reservations/${reservationId}/ical/`;
  },
};
