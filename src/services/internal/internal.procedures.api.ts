import axios from 'axios';
import type { FeedingDays, FeedingProcedure } from '../../types/internal/feeding';
import type { AccommodationProcedure } from '../../types/internal/accomodation';
import type { TransportProcedure, TransportProcedureType } from '../../types/internal/transport';
import type { MaintancePriority, MaintanceProcedure, MaintanceProcedureType } from '../../types/internal/mantenice';
import type { Area, Department, Procedure, ProcedureStats } from '../../types/internal/general';

const url = 'http://localhost:8000/internal-procedures/';

const api = axios.create({
    baseURL: `${url}`,
})

// Feeding Procedure

export const getAllFeedingProcedures = (): Promise<import('axios').AxiosResponse<FeedingDays[]>> => api.get('/feeding-procedures/')

export const getFeedingProcedure = (id: number): Promise<import('axios').AxiosResponse<FeedingProcedure>> => api.get(`/feeding-procedures/${id}/`)

export const createFeedingProcedure = (data: FeedingProcedure): Promise<import('axios').AxiosResponse<FeedingProcedure>> => api.post('/feeding-procedures/', data)

export const updateFeedingProcedure = (id: number, data: FeedingProcedure): Promise<import('axios').AxiosResponse<FeedingProcedure>> => api.put(`/feeding-procedures/${id}/`, data)

export const patchFeedingProcedure = (id: number, data: Partial<FeedingProcedure>): Promise<import('axios').AxiosResponse<FeedingProcedure>> => api.patch(`/feeding-procedures/${id}/`, data)

export const deleteFeedingProcedure = (id: number): Promise<import('axios').AxiosResponse<void>> => api.delete(`/feeding-procedures/${id}/`)

// Accommodation Procedure

export const getAllAccommodationProcedures = (): Promise<import('axios').AxiosResponse<AccommodationProcedure[]>> => api.get('/accommodation-procedures/')

export const getAccommodationProcedure = (id: number): Promise<import('axios').AxiosResponse<AccommodationProcedure>> => api.get(`/accommodation-procedures/${id}/`)

export const createAccommodationProcedure = (data: AccommodationProcedure): Promise<import('axios').AxiosResponse<AccommodationProcedure>> => api.post('/accommodation-procedures/', data)

export const updateAccommodationProcedure = (id: number, data: AccommodationProcedure): Promise<import('axios').AxiosResponse<AccommodationProcedure>> => api.put(`/accommodation-procedures/${id}/`, data)

export const patchAccommodationProcedure = (id: number, data: Partial<AccommodationProcedure>): Promise<import('axios').AxiosResponse<AccommodationProcedure>> => api.patch(`/accommodation-procedures/${id}/`, data)

export const deleteAccommodationProcedure = (id: number): Promise<import('axios').AxiosResponse<void>> => api.delete(`/accommodation-procedures/${id}/`)

// Transport Procedure

export const getAllTransportProcedures = (): Promise<import('axios').AxiosResponse<TransportProcedure[]>> => api.get('/transport-procedures/')

export const getTransportProcedure = (id: number): Promise<import('axios').AxiosResponse<TransportProcedure>> => api.get(`/transport-procedures/${id}/`)

export const createTransportProcedure = (data: TransportProcedure): Promise<import('axios').AxiosResponse<TransportProcedure>> => api.post('/transport-procedures/', data)

export const updateTransportProcedure = (id: number, data: TransportProcedure): Promise<import('axios').AxiosResponse<TransportProcedure>> => api.put(`/transport-procedures/${id}/`, data)

export const patchTransportProcedure = (id: number, data: Partial<TransportProcedure>): Promise<import('axios').AxiosResponse<TransportProcedure>> => api.patch(`/transport-procedures/${id}/`, data)

export const deleteTransportProcedure = (id: number): Promise<import('axios').AxiosResponse<void>> => api.delete(`/transport-procedures/${id}/`)

// Maintance Procedure

export const getAllMaintanceProcedures = (): Promise<import('axios').AxiosResponse<MaintanceProcedure[]>> => api.get('/maintance-procedures/')

export const getMaintanceProcedure = (id: number): Promise<import('axios').AxiosResponse<MaintanceProcedure>> => api.get(`/maintance-procedures/${id}/`)

export const createMaintanceProcedure = (data: MaintanceProcedure): Promise<import('axios').AxiosResponse<MaintanceProcedure>> => api.post('/maintance-procedures/', data)

export const updateMaintanceProcedure = (id: number, data: MaintanceProcedure): Promise<import('axios').AxiosResponse<MaintanceProcedure>> => api.put(`/maintance-procedures/${id}/`, data)

export const patchMaintanceProcedure = (id: number, data: Partial<MaintanceProcedure>): Promise<import('axios').AxiosResponse<MaintanceProcedure>> => api.patch(`/maintance-procedures/${id}/`, data)

export const deleteMaintanceProcedure = (id: number): Promise<import('axios').AxiosResponse<void>> => api.delete(`/maintance-procedures/${id}/`)

// Maintance Procedure Types 

export const getAllMaintanceProceduresTypes = (): Promise<import('axios').AxiosResponse<MaintanceProcedureType[]>> => api.get('/maintance-procedure-types/')

export const getMaintanceProcedureType = (id: number): Promise<import('axios').AxiosResponse<MaintanceProcedureType>> => api.get(`/maintance-procedure-types/${id}/`)

export const createMaintanceProcedureType = (data: MaintanceProcedureType): Promise<import('axios').AxiosResponse<MaintanceProcedureType>> => api.post('/maintance-procedure-types/', data)

export const updateMaintanceProcedureType = (id: number, data: MaintanceProcedureType): Promise<import('axios').AxiosResponse<MaintanceProcedureType>> => api.put(`/maintance-procedure-types/${id}/`, data)

export const patchMaintanceProcedureType = (id: number, data: Partial<MaintanceProcedureType>): Promise<import('axios').AxiosResponse<MaintanceProcedureType>> => api.patch(`/maintance-procedure-types/${id}/`, data)

export const deleteMaintanceProcedureType = (id: number): Promise<import('axios').AxiosResponse<void>> => api.delete(`/maintance-procedure-types/${id}/`)

// Maintance Priorities

export const getAllMaintancePriorities = (): Promise<import('axios').AxiosResponse<MaintancePriority[]>> => api.get('/maintance-priorities/')

export const getMaintancePriorities = (id: number): Promise<import('axios').AxiosResponse<MaintancePriority>> => api.get(`/maintance-priorities/${id}/`)

export const createMaintancePriorities = (data: MaintancePriority): Promise<import('axios').AxiosResponse<MaintancePriority>> => api.post('/maintance-priorities/', data)

export const updateMaintancePriorities = (id: number, data: MaintancePriority): Promise<import('axios').AxiosResponse<MaintancePriority>> => api.put(`/maintance-priorities/${id}/`, data)

export const patchMaintancePriorities = (id: number, data: Partial<MaintancePriority>): Promise<import('axios').AxiosResponse<MaintancePriority>> => api.patch(`/maintance-priorities/${id}/`, data)

export const deleteMaintancePriorities = (id: number): Promise<import('axios').AxiosResponse<void>> => api.delete(`/maintance-priorities/${id}/`)

// Transport Procedure Types

export const getAllTransportProceduresTypes = (): Promise<import('axios').AxiosResponse<TransportProcedureType[]>> => api.get('/transport-procedure-types/')

export const getTransportProcedureType = (id: number): Promise<import('axios').AxiosResponse<TransportProcedureType>> => api.get(`/transport-procedure-types/${id}/`)

export const createTransportProcedureType = (data: TransportProcedureType): Promise<import('axios').AxiosResponse<TransportProcedureType>> => api.post('/transport-procedure-types/', data)

export const updateTransportProcedureType = (id: number, data: TransportProcedureType): Promise<import('axios').AxiosResponse<TransportProcedureType>> => api.put(`/transport-procedure-types/${id}/`, data)

export const patchTransportProcedureType = (id: number, data: Partial<TransportProcedureType>): Promise<import('axios').AxiosResponse<TransportProcedureType>> => api.patch(`/transport-procedure-types/${id}/`, data)

export const deleteTransportProcedureType = (id: number): Promise<import('axios').AxiosResponse<void>> => api.delete(`/transport-procedure-types/${id}/`)

// Departments

export const getAllDepartments = (): Promise<import('axios').AxiosResponse<Department[]>> => api.get('/departments/')

export const getDepartment = (id: number): Promise<import('axios').AxiosResponse<Department>> => api.get(`/departments/${id}/`)

export const createDepartment = (data: Department): Promise<import('axios').AxiosResponse<Department>> => api.post('/departments/', data)

export const updateDepartment = (id: number, data: Department): Promise<import('axios').AxiosResponse<Department>> => api.put(`/departments/${id}/`, data)

export const patchDepartment = (id: number, data: Partial<Department>): Promise<import('axios').AxiosResponse<Department>> => api.patch(`/departments/${id}/`, data)

export const deleteDepartment = (id: number): Promise<import('axios').AxiosResponse<void>> => api.delete(`/departments/${id}/`)

// Areas

export const getAllAreas = (): Promise<import('axios').AxiosResponse<Area[]>> => api.get('/areas/')

export const getArea = (id: number): Promise<import('axios').AxiosResponse<Area>> => api.get(`/areas/${id}/`)

export const createArea = (data: Area): Promise<import('axios').AxiosResponse<Area>> => api.post('/areas/', data)

export const updateArea = (id: number, data: Area): Promise<import('axios').AxiosResponse<Area>> => api.put(`/areas/${id}/`, data)

export const patchArea = (id: number, data: Partial<Area>): Promise<import('axios').AxiosResponse<Area>> => api.patch(`/areas/${id}/`, data)

export const deleteArea = (id: number): Promise<import('axios').AxiosResponse<void>> => api.delete(`/areas/${id}/`)

// Procedures

export const getAllUserProcedures = (): Promise<import('axios').AxiosResponse<Procedure[]>> => api.get('/procedures/')

// Stats

export const getProcedureStats = (type = null): Promise<import('axios').AxiosResponse<ProcedureStats>> => {
    const url = type ? `/stats/?type=${type}` : '/stats/';
    return api.get(url);
};

// PDF 

export const getFeedingProcedurePDFUrl = (id: number): string =>
  `${url}feeding-procedures/${id}/pdf/`;

export const getAccommodationProcedurePDFUrl = (id: number): string =>
  `${url}accommodation-procedures/${id}/pdf/`;

export const getTransportProcedurePDFUrl = (id: number): string =>
  `${url}transport-procedures/${id}/pdf/`;

export const getMaintanceProcedurePDFUrl = (id: number): string =>
  `${url}maintance-procedures/${id}/pdf/`;

/**
 * Actualiza el estado de un trámite según su tipo.
 * @param {string} type - Tipo de trámite: 'feeding', 'accommodation', 'transport', 'maintance'
 * @param {number|string} id - ID del trámite.
 * @param {object} data - Objeto con el nuevo estado, por ejemplo: { state: "APROBADO" }
 * @returns {Promise}
 */

export function patchProcedureState(type: string, id: number, data: object) {
  switch (type) {
    case "feeding":
      return patchFeedingProcedure(id, data);
    case "accommodation":
      return patchAccommodationProcedure(id, data);
    case "transport":
      return patchTransportProcedure(id, data);
    case "maintance":
      return patchMaintanceProcedure(id, data);
    default:
      throw new Error("Tipo de trámite no soportado");
  }
}