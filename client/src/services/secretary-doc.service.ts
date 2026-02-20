import apiClient from '../lib/api-client';
import type {
  SecretaryDocProcedure,
  SecretaryDocProcedureForm,
  ProcedureListResponse,
  SeguimientoTramite,
  Documento
} from '../types/secretary-doc.types';

const BASE_URL = '/tramites-secretaria';

export const secretaryDocService = {
  async getAll(): Promise<ProcedureListResponse<SecretaryDocProcedure>> {
    const response = await apiClient.get<ProcedureListResponse<SecretaryDocProcedure>>(`${BASE_URL}/tramites/`);
    return response.data;
  },

  async getById(id: number): Promise<SecretaryDocProcedure> {
    const response = await apiClient.get<SecretaryDocProcedure>(`${BASE_URL}/tramites/${id}/`);
    return response.data;
  },

  async create(data: SecretaryDocProcedureForm): Promise<SecretaryDocProcedure> {
    const formData = new FormData();
    
    formData.append('study_type', data.study_type);
    formData.append('visibility_type', data.visibility_type);
    formData.append('career', data.career);
    formData.append('year', data.year);
    formData.append('academic_program', data.academic_program);
    formData.append('document_type', data.document_type);
    formData.append('interest', data.interest);
    formData.append('full_name', data.full_name);
    formData.append('id_card', data.id_card);
    formData.append('email', data.email);
    formData.append('phone', data.phone);
    
    if (data.document_file) {
      formData.append('document_file', data.document_file);
    }
    if (data.registry_volume) {
      formData.append('registry_volume', data.registry_volume);
    }
    if (data.folio) {
      formData.append('folio', data.folio);
    }
    if (data.number) {
      formData.append('number', data.number);
    }

    const response = await apiClient.post<SecretaryDocProcedure>(`${BASE_URL}/tramites/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async update(id: number, data: Partial<SecretaryDocProcedureForm>): Promise<SecretaryDocProcedure> {
    const response = await apiClient.patch<SecretaryDocProcedure>(`${BASE_URL}/tramites/${id}/`, data);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(`${BASE_URL}/tramites/${id}/`);
  },

  async changeState(id: number, estado: string): Promise<void> {
    await apiClient.post(`${BASE_URL}/tramites/${id}/cambiar_estado/`, { estado });
  },

  async uploadDocument(tramiteId: number, archivo: File): Promise<Documento> {
    const formData = new FormData();
    formData.append('archivo', archivo);
    
    const response = await apiClient.post<Documento>(
      `${BASE_URL}/tramites/${tramiteId}/subir_documento/`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  async getSeguimientos(tramiteId: number): Promise<SeguimientoTramite[]> {
    const response = await apiClient.get<SeguimientoTramite[]>(`${BASE_URL}/seguimientos/?tramite=${tramiteId}`);
    return response.data;
  },

  async getDocumentos(tramiteId: number): Promise<Documento[]> {
    const response = await apiClient.get<Documento[]>(`${BASE_URL}/documentos/?tramite=${tramiteId}`);
    return response.data;
  }
};
