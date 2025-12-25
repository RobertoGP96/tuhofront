import { apiClient } from '../api';
import type { PaginatedResponse } from '../api/client';
import type { FeedingDays, FeedingProcedure } from '../../types/internal/feeding';
import type { AccommodationProcedure } from '../../types/internal/accomodation';
import type { TransportProcedure, TransportProcedureType } from '../../types/internal/transport';
import type { MaintancePriority, MaintanceProcedure, MaintanceProcedureType } from '../../types/internal/mantenice';
import type { Area, Department } from '../../types/internal/general';

// Endpoints base
const INTERNAL_PROCEDURES_ENDPOINTS = {
  FEEDING_PROCEDURES: '/v1/feeding-procedures/',
  ACCOMMODATION_PROCEDURES: '/v1/accommodation-procedures/',
  TRANSPORT_PROCEDURES: '/v1/transport-procedures/',
  TRANSPORT_PROCEDURE_TYPES: '/v1/transport-procedure-types/',
  MAINTANCE_PROCEDURES: '/v1/maintance-procedures/',
  MAINTANCE_PROCEDURE_TYPES: '/v1/maintance-procedure-types/',
  MAINTANCE_PRIORITIES: '/v1/maintance-priorities/',
  GUESTS: '/v1/guests/',
  FEEDING_DAYS: '/v1/feeding-days/',
  INTERNAL_DEPARTMENTS: '/v1/internal-departments/',
  INTERNAL_AREAS: '/v1/internal-areas/',
  NOTES: '/v1/notes/',
} as const;

class InternalProceduresService {
  // ============ Feeding Procedures ============
  
  async getAllFeedingProcedures(
    page = 1,
    pageSize = 10
  ): Promise<PaginatedResponse<FeedingProcedure>> {
    const params = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString(),
    });

    return apiClient.get<PaginatedResponse<FeedingProcedure>>(
      `${INTERNAL_PROCEDURES_ENDPOINTS.FEEDING_PROCEDURES}?${params}`
    );
  }

  async getFeedingProcedure(id: number): Promise<FeedingProcedure> {
    return apiClient.get<FeedingProcedure>(
      `${INTERNAL_PROCEDURES_ENDPOINTS.FEEDING_PROCEDURES}${id}/`
    );
  }

  async createFeedingProcedure(data: Partial<FeedingProcedure>): Promise<FeedingProcedure> {
    return apiClient.post<FeedingProcedure>(
      INTERNAL_PROCEDURES_ENDPOINTS.FEEDING_PROCEDURES,
      data
    );
  }

  async updateFeedingProcedure(id: number, data: Partial<FeedingProcedure>): Promise<FeedingProcedure> {
    return apiClient.put<FeedingProcedure>(
      `${INTERNAL_PROCEDURES_ENDPOINTS.FEEDING_PROCEDURES}${id}/`,
      data
    );
  }

  async patchFeedingProcedure(id: number, data: Partial<FeedingProcedure>): Promise<FeedingProcedure> {
    return apiClient.patch<FeedingProcedure>(
      `${INTERNAL_PROCEDURES_ENDPOINTS.FEEDING_PROCEDURES}${id}/`,
      data
    );
  }

  async deleteFeedingProcedure(id: number): Promise<void> {
    await apiClient.delete(`${INTERNAL_PROCEDURES_ENDPOINTS.FEEDING_PROCEDURES}${id}/`);
  }

  // ============ Accommodation Procedures ============

  async getAllAccommodationProcedures(
    page = 1,
    pageSize = 10
  ): Promise<PaginatedResponse<AccommodationProcedure>> {
    const params = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString(),
    });

    return apiClient.get<PaginatedResponse<AccommodationProcedure>>(
      `${INTERNAL_PROCEDURES_ENDPOINTS.ACCOMMODATION_PROCEDURES}?${params}`
    );
  }

  async getAccommodationProcedure(id: number): Promise<AccommodationProcedure> {
    return apiClient.get<AccommodationProcedure>(
      `${INTERNAL_PROCEDURES_ENDPOINTS.ACCOMMODATION_PROCEDURES}${id}/`
    );
  }

  async createAccommodationProcedure(data: Partial<AccommodationProcedure>): Promise<AccommodationProcedure> {
    return apiClient.post<AccommodationProcedure>(
      INTERNAL_PROCEDURES_ENDPOINTS.ACCOMMODATION_PROCEDURES,
      data
    );
  }

  async updateAccommodationProcedure(id: number, data: Partial<AccommodationProcedure>): Promise<AccommodationProcedure> {
    return apiClient.put<AccommodationProcedure>(
      `${INTERNAL_PROCEDURES_ENDPOINTS.ACCOMMODATION_PROCEDURES}${id}/`,
      data
    );
  }

  async patchAccommodationProcedure(id: number, data: Partial<AccommodationProcedure>): Promise<AccommodationProcedure> {
    return apiClient.patch<AccommodationProcedure>(
      `${INTERNAL_PROCEDURES_ENDPOINTS.ACCOMMODATION_PROCEDURES}${id}/`,
      data
    );
  }

  async deleteAccommodationProcedure(id: number): Promise<void> {
    await apiClient.delete(`${INTERNAL_PROCEDURES_ENDPOINTS.ACCOMMODATION_PROCEDURES}${id}/`);
  }

  // ============ Transport Procedures ============

  async getAllTransportProcedures(
    page = 1,
    pageSize = 10
  ): Promise<PaginatedResponse<TransportProcedure>> {
    const params = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString(),
    });

    return apiClient.get<PaginatedResponse<TransportProcedure>>(
      `${INTERNAL_PROCEDURES_ENDPOINTS.TRANSPORT_PROCEDURES}?${params}`
    );
  }

  async getTransportProcedure(id: number): Promise<TransportProcedure> {
    return apiClient.get<TransportProcedure>(
      `${INTERNAL_PROCEDURES_ENDPOINTS.TRANSPORT_PROCEDURES}${id}/`
    );
  }

  async createTransportProcedure(data: Partial<TransportProcedure>): Promise<TransportProcedure> {
    return apiClient.post<TransportProcedure>(
      INTERNAL_PROCEDURES_ENDPOINTS.TRANSPORT_PROCEDURES,
      data
    );
  }

  async updateTransportProcedure(id: number, data: Partial<TransportProcedure>): Promise<TransportProcedure> {
    return apiClient.put<TransportProcedure>(
      `${INTERNAL_PROCEDURES_ENDPOINTS.TRANSPORT_PROCEDURES}${id}/`,
      data
    );
  }

  async patchTransportProcedure(id: number, data: Partial<TransportProcedure>): Promise<TransportProcedure> {
    return apiClient.patch<TransportProcedure>(
      `${INTERNAL_PROCEDURES_ENDPOINTS.TRANSPORT_PROCEDURES}${id}/`,
      data
    );
  }

  async deleteTransportProcedure(id: number): Promise<void> {
    await apiClient.delete(`${INTERNAL_PROCEDURES_ENDPOINTS.TRANSPORT_PROCEDURES}${id}/`);
  }

  // ============ Transport Procedure Types ============

  async getAllTransportProcedureTypes(): Promise<TransportProcedureType[]> {
    return apiClient.get<TransportProcedureType[]>(
      INTERNAL_PROCEDURES_ENDPOINTS.TRANSPORT_PROCEDURE_TYPES
    );
  }

  async getTransportProcedureType(id: number): Promise<TransportProcedureType> {
    return apiClient.get<TransportProcedureType>(
      `${INTERNAL_PROCEDURES_ENDPOINTS.TRANSPORT_PROCEDURE_TYPES}${id}/`
    );
  }

  async createTransportProcedureType(data: Partial<TransportProcedureType>): Promise<TransportProcedureType> {
    return apiClient.post<TransportProcedureType>(
      INTERNAL_PROCEDURES_ENDPOINTS.TRANSPORT_PROCEDURE_TYPES,
      data
    );
  }

  async updateTransportProcedureType(id: number, data: Partial<TransportProcedureType>): Promise<TransportProcedureType> {
    return apiClient.put<TransportProcedureType>(
      `${INTERNAL_PROCEDURES_ENDPOINTS.TRANSPORT_PROCEDURE_TYPES}${id}/`,
      data
    );
  }

  async patchTransportProcedureType(id: number, data: Partial<TransportProcedureType>): Promise<TransportProcedureType> {
    return apiClient.patch<TransportProcedureType>(
      `${INTERNAL_PROCEDURES_ENDPOINTS.TRANSPORT_PROCEDURE_TYPES}${id}/`,
      data
    );
  }

  async deleteTransportProcedureType(id: number): Promise<void> {
    await apiClient.delete(`${INTERNAL_PROCEDURES_ENDPOINTS.TRANSPORT_PROCEDURE_TYPES}${id}/`);
  }

  // ============ Maintance Procedures ============

  async getAllMaintanceProcedures(
    page = 1,
    pageSize = 10
  ): Promise<PaginatedResponse<MaintanceProcedure>> {
    const params = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString(),
    });

    return apiClient.get<PaginatedResponse<MaintanceProcedure>>(
      `${INTERNAL_PROCEDURES_ENDPOINTS.MAINTANCE_PROCEDURES}?${params}`
    );
  }

  async getMaintanceProcedure(id: number): Promise<MaintanceProcedure> {
    return apiClient.get<MaintanceProcedure>(
      `${INTERNAL_PROCEDURES_ENDPOINTS.MAINTANCE_PROCEDURES}${id}/`
    );
  }

  async createMaintanceProcedure(data: Partial<MaintanceProcedure>): Promise<MaintanceProcedure> {
    return apiClient.post<MaintanceProcedure>(
      INTERNAL_PROCEDURES_ENDPOINTS.MAINTANCE_PROCEDURES,
      data
    );
  }

  async updateMaintanceProcedure(id: number, data: Partial<MaintanceProcedure>): Promise<MaintanceProcedure> {
    return apiClient.put<MaintanceProcedure>(
      `${INTERNAL_PROCEDURES_ENDPOINTS.MAINTANCE_PROCEDURES}${id}/`,
      data
    );
  }

  async patchMaintanceProcedure(id: number, data: Partial<MaintanceProcedure>): Promise<MaintanceProcedure> {
    return apiClient.patch<MaintanceProcedure>(
      `${INTERNAL_PROCEDURES_ENDPOINTS.MAINTANCE_PROCEDURES}${id}/`,
      data
    );
  }

  async deleteMaintanceProcedure(id: number): Promise<void> {
    await apiClient.delete(`${INTERNAL_PROCEDURES_ENDPOINTS.MAINTANCE_PROCEDURES}${id}/`);
  }

  // ============ Maintance Procedure Types ============

  async getAllMaintanceProcedureTypes(): Promise<MaintanceProcedureType[]> {
    return apiClient.get<MaintanceProcedureType[]>(
      INTERNAL_PROCEDURES_ENDPOINTS.MAINTANCE_PROCEDURE_TYPES
    );
  }

  async getMaintanceProcedureType(id: number): Promise<MaintanceProcedureType> {
    return apiClient.get<MaintanceProcedureType>(
      `${INTERNAL_PROCEDURES_ENDPOINTS.MAINTANCE_PROCEDURE_TYPES}${id}/`
    );
  }

  async createMaintanceProcedureType(data: Partial<MaintanceProcedureType>): Promise<MaintanceProcedureType> {
    return apiClient.post<MaintanceProcedureType>(
      INTERNAL_PROCEDURES_ENDPOINTS.MAINTANCE_PROCEDURE_TYPES,
      data
    );
  }

  async updateMaintanceProcedureType(id: number, data: Partial<MaintanceProcedureType>): Promise<MaintanceProcedureType> {
    return apiClient.put<MaintanceProcedureType>(
      `${INTERNAL_PROCEDURES_ENDPOINTS.MAINTANCE_PROCEDURE_TYPES}${id}/`,
      data
    );
  }

  async patchMaintanceProcedureType(id: number, data: Partial<MaintanceProcedureType>): Promise<MaintanceProcedureType> {
    return apiClient.patch<MaintanceProcedureType>(
      `${INTERNAL_PROCEDURES_ENDPOINTS.MAINTANCE_PROCEDURE_TYPES}${id}/`,
      data
    );
  }

  async deleteMaintanceProcedureType(id: number): Promise<void> {
    await apiClient.delete(`${INTERNAL_PROCEDURES_ENDPOINTS.MAINTANCE_PROCEDURE_TYPES}${id}/`);
  }

  // ============ Maintance Priorities ============

  async getAllMaintancePriorities(): Promise<MaintancePriority[]> {
    return apiClient.get<MaintancePriority[]>(
      INTERNAL_PROCEDURES_ENDPOINTS.MAINTANCE_PRIORITIES
    );
  }

  async getMaintancePriority(id: number): Promise<MaintancePriority> {
    return apiClient.get<MaintancePriority>(
      `${INTERNAL_PROCEDURES_ENDPOINTS.MAINTANCE_PRIORITIES}${id}/`
    );
  }

  async createMaintancePriority(data: Partial<MaintancePriority>): Promise<MaintancePriority> {
    return apiClient.post<MaintancePriority>(
      INTERNAL_PROCEDURES_ENDPOINTS.MAINTANCE_PRIORITIES,
      data
    );
  }

  async updateMaintancePriority(id: number, data: Partial<MaintancePriority>): Promise<MaintancePriority> {
    return apiClient.put<MaintancePriority>(
      `${INTERNAL_PROCEDURES_ENDPOINTS.MAINTANCE_PRIORITIES}${id}/`,
      data
    );
  }

  async patchMaintancePriority(id: number, data: Partial<MaintancePriority>): Promise<MaintancePriority> {
    return apiClient.patch<MaintancePriority>(
      `${INTERNAL_PROCEDURES_ENDPOINTS.MAINTANCE_PRIORITIES}${id}/`,
      data
    );
  }

  async deleteMaintancePriority(id: number): Promise<void> {
    await apiClient.delete(`${INTERNAL_PROCEDURES_ENDPOINTS.MAINTANCE_PRIORITIES}${id}/`);
  }

  // ============ Guests ============

  async getAllGuests(
    page = 1,
    pageSize = 10
  ): Promise<PaginatedResponse<any>> {
    const params = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString(),
    });

    return apiClient.get<PaginatedResponse<any>>(
      `${INTERNAL_PROCEDURES_ENDPOINTS.GUESTS}?${params}`
    );
  }

  async getGuest(id: number): Promise<any> {
    return apiClient.get<any>(
      `${INTERNAL_PROCEDURES_ENDPOINTS.GUESTS}${id}/`
    );
  }

  async createGuest(data: any): Promise<any> {
    return apiClient.post<any>(
      INTERNAL_PROCEDURES_ENDPOINTS.GUESTS,
      data
    );
  }

  async updateGuest(id: number, data: any): Promise<any> {
    return apiClient.put<any>(
      `${INTERNAL_PROCEDURES_ENDPOINTS.GUESTS}${id}/`,
      data
    );
  }

  async patchGuest(id: number, data: any): Promise<any> {
    return apiClient.patch<any>(
      `${INTERNAL_PROCEDURES_ENDPOINTS.GUESTS}${id}/`,
      data
    );
  }

  async deleteGuest(id: number): Promise<void> {
    await apiClient.delete(`${INTERNAL_PROCEDURES_ENDPOINTS.GUESTS}${id}/`);
  }

  // ============ Feeding Days ============

  async getAllFeedingDays(): Promise<FeedingDays[]> {
    return apiClient.get<FeedingDays[]>(
      INTERNAL_PROCEDURES_ENDPOINTS.FEEDING_DAYS
    );
  }

  async getFeedingDay(id: number): Promise<FeedingDays> {
    return apiClient.get<FeedingDays>(
      `${INTERNAL_PROCEDURES_ENDPOINTS.FEEDING_DAYS}${id}/`
    );
  }

  async createFeedingDay(data: Partial<FeedingDays>): Promise<FeedingDays> {
    return apiClient.post<FeedingDays>(
      INTERNAL_PROCEDURES_ENDPOINTS.FEEDING_DAYS,
      data
    );
  }

  async updateFeedingDay(id: number, data: Partial<FeedingDays>): Promise<FeedingDays> {
    return apiClient.put<FeedingDays>(
      `${INTERNAL_PROCEDURES_ENDPOINTS.FEEDING_DAYS}${id}/`,
      data
    );
  }

  async patchFeedingDay(id: number, data: Partial<FeedingDays>): Promise<FeedingDays> {
    return apiClient.patch<FeedingDays>(
      `${INTERNAL_PROCEDURES_ENDPOINTS.FEEDING_DAYS}${id}/`,
      data
    );
  }

  async deleteFeedingDay(id: number): Promise<void> {
    await apiClient.delete(`${INTERNAL_PROCEDURES_ENDPOINTS.FEEDING_DAYS}${id}/`);
  }

  // ============ Internal Departments ============

  async getAllInternalDepartments(): Promise<Department[]> {
    return apiClient.get<Department[]>(
      INTERNAL_PROCEDURES_ENDPOINTS.INTERNAL_DEPARTMENTS
    );
  }

  async getInternalDepartment(id: number): Promise<Department> {
    return apiClient.get<Department>(
      `${INTERNAL_PROCEDURES_ENDPOINTS.INTERNAL_DEPARTMENTS}${id}/`
    );
  }

  async createInternalDepartment(data: Partial<Department>): Promise<Department> {
    return apiClient.post<Department>(
      INTERNAL_PROCEDURES_ENDPOINTS.INTERNAL_DEPARTMENTS,
      data
    );
  }

  async updateInternalDepartment(id: number, data: Partial<Department>): Promise<Department> {
    return apiClient.put<Department>(
      `${INTERNAL_PROCEDURES_ENDPOINTS.INTERNAL_DEPARTMENTS}${id}/`,
      data
    );
  }

  async patchInternalDepartment(id: number, data: Partial<Department>): Promise<Department> {
    return apiClient.patch<Department>(
      `${INTERNAL_PROCEDURES_ENDPOINTS.INTERNAL_DEPARTMENTS}${id}/`,
      data
    );
  }

  async deleteInternalDepartment(id: number): Promise<void> {
    await apiClient.delete(`${INTERNAL_PROCEDURES_ENDPOINTS.INTERNAL_DEPARTMENTS}${id}/`);
  }

  // ============ Internal Areas ============

  async getAllInternalAreas(): Promise<Area[]> {
    return apiClient.get<Area[]>(
      INTERNAL_PROCEDURES_ENDPOINTS.INTERNAL_AREAS
    );
  }

  async getInternalArea(id: number): Promise<Area> {
    return apiClient.get<Area>(
      `${INTERNAL_PROCEDURES_ENDPOINTS.INTERNAL_AREAS}${id}/`
    );
  }

  async createInternalArea(data: Partial<Area>): Promise<Area> {
    return apiClient.post<Area>(
      INTERNAL_PROCEDURES_ENDPOINTS.INTERNAL_AREAS,
      data
    );
  }

  async updateInternalArea(id: number, data: Partial<Area>): Promise<Area> {
    return apiClient.put<Area>(
      `${INTERNAL_PROCEDURES_ENDPOINTS.INTERNAL_AREAS}${id}/`,
      data
    );
  }

  async patchInternalArea(id: number, data: Partial<Area>): Promise<Area> {
    return apiClient.patch<Area>(
      `${INTERNAL_PROCEDURES_ENDPOINTS.INTERNAL_AREAS}${id}/`,
      data
    );
  }

  async deleteInternalArea(id: number): Promise<void> {
    await apiClient.delete(`${INTERNAL_PROCEDURES_ENDPOINTS.INTERNAL_AREAS}${id}/`);
  }

  // ============ Notes ============

  async getAllNotes(
    page = 1,
    pageSize = 10
  ): Promise<PaginatedResponse<any>> {
    const params = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString(),
    });

    return apiClient.get<PaginatedResponse<any>>(
      `${INTERNAL_PROCEDURES_ENDPOINTS.NOTES}?${params}`
    );
  }

  async getNote(id: number): Promise<any> {
    return apiClient.get<any>(
      `${INTERNAL_PROCEDURES_ENDPOINTS.NOTES}${id}/`
    );
  }

  async createNote(data: any): Promise<any> {
    return apiClient.post<any>(
      INTERNAL_PROCEDURES_ENDPOINTS.NOTES,
      data
    );
  }

  async updateNote(id: number, data: any): Promise<any> {
    return apiClient.put<any>(
      `${INTERNAL_PROCEDURES_ENDPOINTS.NOTES}${id}/`,
      data
    );
  }

  async patchNote(id: number, data: any): Promise<any> {
    return apiClient.patch<any>(
      `${INTERNAL_PROCEDURES_ENDPOINTS.NOTES}${id}/`,
      data
    );
  }

  async deleteNote(id: number): Promise<void> {
    await apiClient.delete(`${INTERNAL_PROCEDURES_ENDPOINTS.NOTES}${id}/`);
  }

  // ============ Utility Methods ============

  /**
   * Actualiza el estado de un trámite según su tipo.
   */
  async patchProcedureState(
    type: 'feeding' | 'accommodation' | 'transport' | 'maintance',
    id: number,
    data: any
  ): Promise<any> {
    switch (type) {
      case 'feeding':
        return this.patchFeedingProcedure(id, data);
      case 'accommodation':
        return this.patchAccommodationProcedure(id, data);
      case 'transport':
        return this.patchTransportProcedure(id, data);
      case 'maintance':
        return this.patchMaintanceProcedure(id, data);
      default:
        throw new Error('Tipo de trámite no soportado');
    }
  }
}

// Instancia singleton del servicio
export const internalProceduresService = new InternalProceduresService();

// Export default para compatibilidad
export default internalProceduresService;

