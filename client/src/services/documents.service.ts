import apiClient from '../lib/api-client';

export interface OfficialDocument {
  id: number;
  title: string;
  doc_type: 'procedure' | 'reservation' | 'certificate' | 'other';
  verification_code: string;
  resource_type: string;
  resource_id: string;
  file: string;
  file_url: string | null;
  issued_by: number | null;
  issued_by_name: string | null;
  issued_to: number | null;
  issued_to_name: string | null;
  created_at: string;
  expires_at: string | null;
  revoked: boolean;
  revoked_reason: string;
  revoked_at: string | null;
  metadata: Record<string, unknown>;
}

export interface VerifyResult {
  valid: boolean;
  revoked: boolean;
  revoked_reason: string;
  revoked_at: string | null;
  title: string;
  doc_type: string;
  resource_type: string;
  issued_at: string;
  expires_at: string | null;
  verification_code: string;
}

export const documentsService = {
  async mine(): Promise<OfficialDocument[]> {
    const { data } = await apiClient.get<{ results: OfficialDocument[] } | OfficialDocument[]>(
      '/documents/',
    );
    return Array.isArray(data) ? data : data.results;
  },

  async issueReservation(reservationId: string): Promise<OfficialDocument> {
    const { data } = await apiClient.post<OfficialDocument>(
      `/documents/issue/reservation/${reservationId}/`,
    );
    return data;
  },

  async issueProcedure(appLabel: string, model: string, pk: string): Promise<OfficialDocument> {
    const { data } = await apiClient.post<OfficialDocument>(
      `/documents/issue/procedure/${appLabel}/${model}/${pk}/`,
    );
    return data;
  },

  async verify(code: string): Promise<VerifyResult> {
    const { data } = await apiClient.get<VerifyResult>(`/documents/verify/${code}/`);
    return data;
  },
};
