import apiClient from '../lib/api-client';

export interface PublicTrackingResult {
  found: boolean;
  resource_type?: string;
  resource_name?: string;
  state?: string;
  state_display?: string;
  created_at?: string;
  updated_at?: string;
  tracking_code?: string;
}

export const publicService = {
  async trackProcedure(code: string, idCard: string): Promise<PublicTrackingResult> {
    const { data } = await apiClient.get<PublicTrackingResult>('/public/tracking/', {
      params: { code, id_card: idCard },
    });
    return data;
  },
};
