import apiClient from '../lib/api-client';
import type {
  FeedingProcedure,
  FeedingProcedureForm,
  AccommodationProcedure,
  AccommodationProcedureForm,
  TransportProcedure,
  TransportProcedureForm,
  MaintanceProcedure,
  MaintanceProcedureForm,
  ProcedureListResponse,
  TransportProcedureType,
  MaintanceProcedureType,
  MaintancePriority,
  Department,
  Area
} from '../types/internal.types';

const BASE_URL = '/internal';

// Feeding Procedures
export const feedingService = {
  async getAll(): Promise<ProcedureListResponse<FeedingProcedure>> {
    const response = await apiClient.get<ProcedureListResponse<FeedingProcedure>>(`${BASE_URL}/feeding-procedures/`);
    return response.data;
  },

  async getById(id: number): Promise<FeedingProcedure> {
    const response = await apiClient.get<FeedingProcedure>(`${BASE_URL}/feeding-procedures/${id}/`);
    return response.data;
  },

  async create(data: FeedingProcedureForm): Promise<FeedingProcedure> {
    const response = await apiClient.post<FeedingProcedure>(`${BASE_URL}/feeding-procedures/`, data);
    return response.data;
  },

  async update(id: number, data: Partial<FeedingProcedureForm>): Promise<FeedingProcedure> {
    const response = await apiClient.patch<FeedingProcedure>(`${BASE_URL}/feeding-procedures/${id}/`, data);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(`${BASE_URL}/feeding-procedures/${id}/`);
  }
};

// Accommodation Procedures
export const accommodationService = {
  async getAll(): Promise<ProcedureListResponse<AccommodationProcedure>> {
    const response = await apiClient.get<ProcedureListResponse<AccommodationProcedure>>(`${BASE_URL}/accommodation-procedures/`);
    return response.data;
  },

  async getById(id: number): Promise<AccommodationProcedure> {
    const response = await apiClient.get<AccommodationProcedure>(`${BASE_URL}/accommodation-procedures/${id}/`);
    return response.data;
  },

  async create(data: AccommodationProcedureForm): Promise<AccommodationProcedure> {
    const response = await apiClient.post<AccommodationProcedure>(`${BASE_URL}/accommodation-procedures/`, data);
    return response.data;
  },

  async update(id: number, data: Partial<AccommodationProcedureForm>): Promise<AccommodationProcedure> {
    const response = await apiClient.patch<AccommodationProcedure>(`${BASE_URL}/accommodation-procedures/${id}/`, data);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(`${BASE_URL}/accommodation-procedures/${id}/`);
  }
};

// Transport Procedures
export const transportService = {
  async getAll(): Promise<ProcedureListResponse<TransportProcedure>> {
    const response = await apiClient.get<ProcedureListResponse<TransportProcedure>>(`${BASE_URL}/transport-procedures/`);
    return response.data;
  },

  async getById(id: number): Promise<TransportProcedure> {
    const response = await apiClient.get<TransportProcedure>(`${BASE_URL}/transport-procedures/${id}/`);
    return response.data;
  },

  async create(data: TransportProcedureForm): Promise<TransportProcedure> {
    const response = await apiClient.post<TransportProcedure>(`${BASE_URL}/transport-procedures/`, data);
    return response.data;
  },

  async update(id: number, data: Partial<TransportProcedureForm>): Promise<TransportProcedure> {
    const response = await apiClient.patch<TransportProcedure>(`${BASE_URL}/transport-procedures/${id}/`, data);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(`${BASE_URL}/transport-procedures/${id}/`);
  },

  async getTypes(): Promise<TransportProcedureType[]> {
    const response = await apiClient.get<TransportProcedureType[]>(`${BASE_URL}/transport-procedure-types/`);
    return response.data;
  }
};

// Maintenance Procedures
export const maintenanceService = {
  async getAll(): Promise<ProcedureListResponse<MaintanceProcedure>> {
    const response = await apiClient.get<ProcedureListResponse<MaintanceProcedure>>(`${BASE_URL}/maintance-procedures/`);
    return response.data;
  },

  async getById(id: number): Promise<MaintanceProcedure> {
    const response = await apiClient.get<MaintanceProcedure>(`${BASE_URL}/maintance-procedures/${id}/`);
    return response.data;
  },

  async create(data: FormData): Promise<MaintanceProcedure> {
    const response = await apiClient.post<MaintanceProcedure>(`${BASE_URL}/maintance-procedures/`, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async update(id: number, data: FormData): Promise<MaintanceProcedure> {
    const response = await apiClient.patch<MaintanceProcedure>(`${BASE_URL}/maintance-procedures/${id}/`, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(`${BASE_URL}/maintance-procedures/${id}/`);
  },

  async getTypes(): Promise<MaintanceProcedureType[]> {
    const response = await apiClient.get<MaintanceProcedureType[]>(`${BASE_URL}/maintance-procedure-types/`);
    return response.data;
  },

  async getPriorities(): Promise<MaintancePriority[]> {
    const response = await apiClient.get<MaintancePriority[]>(`${BASE_URL}/maintance-priorities/`);
    return response.data;
  }
};

// Supporting data
export const supportingDataService = {
  async getDepartments(): Promise<Department[]> {
    const response = await apiClient.get<Department[]>('/departments/');
    return response.data;
  },

  async getAreas(): Promise<Area[]> {
    const response = await apiClient.get<Area[]>('/areas/');
    return response.data;
  }
};

// Utility function to convert form data to FormData for maintenance procedures
export const createMaintenanceFormData = (data: MaintanceProcedureForm): FormData => {
  const formData = new FormData();
  
  formData.append('description', data.description);
  formData.append('procedure_type', data.procedure_type.toString());
  formData.append('priority', data.priority.toString());
  
  if (data.picture) {
    formData.append('picture', data.picture);
  }
  
  return formData;
};
