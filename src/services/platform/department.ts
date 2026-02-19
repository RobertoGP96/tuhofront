import type { PaginatedResponse } from '@/lib/client';
import { apiClient } from '@/lib/client';
import type {
  CreateDepartmentData,
  Department,
  DepartmentFilterOptions,
  DepartmentListItem,
  DepartmentStats,
  DepartmentTreeNode,
  UpdateDepartmentData
} from '@/types/department';

const DEPARTMENT_ENDPOINTS = {
  DEPARTMENTS: '/v1/departments/',
  TREE: '/v1/departments/tree/',
  STATS: '/v1/departments/stats/',
} as const;

class DepartmentService {
  /**
   * Get paginated list of departments
   */
  async getDepartments(
    filters: DepartmentFilterOptions = {}
  ): Promise<PaginatedResponse<DepartmentListItem>> {
    const { page = 1, page_size = 10, search, is_active, parent_id } = filters;
    
    const params = new URLSearchParams({
      page: page.toString(),
      page_size: page_size.toString(),
    });

    if (search) {
      params.append('search', search);
    }
    
    if (is_active !== undefined) {
      params.append('is_active', is_active.toString());
    }

    if (parent_id) {
      params.append('parent_department', parent_id);
    }

    const response = await apiClient.get<PaginatedResponse<DepartmentListItem>>(
      `${DEPARTMENT_ENDPOINTS.DEPARTMENTS}?${params}`
    );

    return response;
  }

  /**
   * Get department tree (hierarchy)
   */
  async getDepartmentTree(): Promise<DepartmentTreeNode[]> {
    const response = await apiClient.get<DepartmentTreeNode[]>(
      DEPARTMENT_ENDPOINTS.TREE
    );
    return response;
  }

  /**
   * Get a department by ID
   */
  async getDepartmentById(id: string): Promise<Department> {
    const response = await apiClient.get<Department>(
      `${DEPARTMENT_ENDPOINTS.DEPARTMENTS}${id}/`
    );

    return response;
  }

  /**
   * Create a new department
   */
  async createDepartment(data: CreateDepartmentData): Promise<Department> {
    const response = await apiClient.post<Department>(
      DEPARTMENT_ENDPOINTS.DEPARTMENTS,
      data
    );

    return response;
  }

  /**
   * Update an existing department
   */
  async updateDepartment(id: string, data: UpdateDepartmentData): Promise<Department> {
    const response = await apiClient.patch<Department>(
      `${DEPARTMENT_ENDPOINTS.DEPARTMENTS}${id}/`,
      data
    );

    return response;
  }

  /**
   * Delete a department
   */
  async deleteDepartment(id: string): Promise<void> {
    await apiClient.delete(`${DEPARTMENT_ENDPOINTS.DEPARTMENTS}${id}/`);
  }

  /**
   * Get department statistics
   */
  async getDepartmentStats(): Promise<DepartmentStats> {
    const response = await apiClient.get<DepartmentStats>(
      DEPARTMENT_ENDPOINTS.STATS
    );
    return response;
  }

  /**
   * Toggle department active status
   */
  async toggleDepartmentStatus(id: string, isActive: boolean): Promise<Department> {
    return this.updateDepartment(id, { is_active: isActive });
  }
}

export const departmentService = new DepartmentService();
export default departmentService;
