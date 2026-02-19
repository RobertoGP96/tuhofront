import { apiClient } from '@/lib/client';
import type { 
  Area, 
  AreaListItem, 
  AreaDetail, 
  CreateAreaData, 
  UpdateAreaData, 
  AreaFilterOptions,
  AreaStats 
} from '@/types/area';
import type { PaginatedResponse } from '@/lib/client';

const AREA_ENDPOINTS = {
  AREAS: '/v1/areas/',
  STATS: '/v1/areas/stats/',
} as const;

class AreaService {
  /**
   * Get paginated list of areas with filters
   */
  async getAreas(
    filters?: AreaFilterOptions
  ): Promise<PaginatedResponse<AreaListItem>> {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach(v => params.append(key, v.toString()));
          } else {
            params.append(key, value.toString());
          }
        }
      });
    }

    const response = await apiClient.get<PaginatedResponse<AreaListItem>>(
      `${AREA_ENDPOINTS.AREAS}?${params}`
    );

    return response;
  }

  /**
   * Get an area by ID with full details
   */
  async getAreaById(id: string): Promise<AreaDetail> {
    const response = await apiClient.get<AreaDetail>(
      `${AREA_ENDPOINTS.AREAS}${id}/`
    );

    return response;
  }

  /**
   * Create a new area
   */
  async createArea(data: CreateAreaData): Promise<Area> {
    const response = await apiClient.post<Area>(
      AREA_ENDPOINTS.AREAS,
      data
    );

    return response;
  }

  /**
   * Update an existing area
   */
  async updateArea(id: string, data: UpdateAreaData): Promise<Area> {
    const response = await apiClient.patch<Area>(
      `${AREA_ENDPOINTS.AREAS}${id}/`,
      data
    );

    return response;
  }

  /**
   * Delete an area
   */
  async deleteArea(id: string): Promise<void> {
    await apiClient.delete(`${AREA_ENDPOINTS.AREAS}${id}/`);
  }

  /**
   * Get area statistics
   * NOTE: This endpoint does not exist in backend
   */
  async getAreaStats(): Promise<AreaStats> {
    throw new Error('El endpoint de estadísticas de áreas no está implementado en el backend');
  }

  /**
   * Toggle area active status
   */
  async toggleAreaStatus(id: string, isActive: boolean): Promise<Area> {
    return this.updateArea(id, { is_active: isActive });
  }
}

export const areaService = new AreaService();
export default areaService;
