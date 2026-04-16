import apiClient from '../lib/api-client';

export interface PublicSystemSettings {
  institution_name: string;
  institution_short_name: string;
  institution_address: string;
  institution_website: string;
  support_email: string;
  modules: {
    internal: boolean;
    secretary: boolean;
    labs: boolean;
    news: boolean;
  };
  reservation: {
    min_minutes: number;
    max_minutes: number;
    open_hour: number;
    close_hour: number;
    advance_days: number;
  };
}

export interface FullSystemSettings extends PublicSystemSettings {
  id: number;
  institution_logo: string | null;
  module_internal_enabled: boolean;
  module_secretary_enabled: boolean;
  module_labs_enabled: boolean;
  module_news_enabled: boolean;
  reservation_min_minutes: number;
  reservation_max_minutes: number;
  reservation_open_hour: number;
  reservation_close_hour: number;
  reservation_advance_days: number;
  signature_enabled: boolean;
  qr_verification_enabled: boolean;
  updated_at: string;
  updated_by: number | null;
}

export const settingsService = {
  async getPublic(): Promise<PublicSystemSettings> {
    const { data } = await apiClient.get<PublicSystemSettings>('/settings/public/');
    return data;
  },

  async getFull(): Promise<FullSystemSettings> {
    const { data } = await apiClient.get<FullSystemSettings>('/settings/');
    return data;
  },

  async update(patch: Partial<FullSystemSettings>): Promise<FullSystemSettings> {
    const { data } = await apiClient.patch<FullSystemSettings>('/settings/', patch);
    return data;
  },
};
