import { BaseModel } from './base';

/**
 * Department interface
 */
export interface Department extends BaseModel {
  name: string;
  description?: string | null;
  code: string;
  is_active: boolean;
  parent_department: string | null; // Department ID or null for top-level
  manager: number | null; // User ID of department manager
  contact_email: string | null;
  contact_phone: string | null;
  location: string | null;
  total_areas: number;
}

/**
 * Detailed information for a department
 */
export type DepartmentDetail = Department;


/**
 * Department list item (for dropdowns/lists)
 */
export interface DepartmentListItem {
  id: string;
  name: string;
  code: string;
  is_active: boolean;
  total_areas: number;
  manager_name: string | null;
}

/**
 * Department tree node (for hierarchical display)
 */
export interface DepartmentTreeNode extends Department {
  children: DepartmentTreeNode[];
  level: number;
}

/**
 * Department statistics
 */
export interface DepartmentStats {
  total_departments: number;
  active_departments: number;
  total_areas: number;
  total_staff: number;
  by_type: Record<string, number>;
}

/**
 * Data needed to create a new department
 */
export interface CreateDepartmentData {
  name: string;
  code: string;
  description?: string;
  parent_department?: string | null;
  manager?: number | null;
  contact_email?: string | null;
  contact_phone?: string | null;
  location?: string | null;
}

/**
 * Data needed to update a department
 */
export type UpdateDepartmentData = Partial<Omit<CreateDepartmentData, 'code'>> & {
  is_active?: boolean;
};

/**
 * Filter options for departments
 */
export interface DepartmentFilterOptions {
  is_active?: boolean;
  has_manager?: boolean;
  parent_id?: string;
  search?: string;
  sort_by?: 'name' | 'code' | 'manager';
  sort_order?: 'asc' | 'desc';
  page?: number;
  page_size?: number;
}
