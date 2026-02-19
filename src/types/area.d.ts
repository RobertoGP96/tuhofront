import { BaseModel } from './base';

/**
 * Area interface
 */
export interface Area extends BaseModel {
  name: string;
  description: string | null;
  code: string;
  department: string; // Department ID
  department_name: string;
  manager: number | null; // User ID of area manager
  parent_area: string | null; // Parent Area ID or null for top-level
  is_active: boolean;
  floor: string | null;
  room: string | null;
  capacity: number | null;
  contact_email: string | null;
  contact_phone: string | null;
  working_hours: string | null;
  responsible_users: number[]; // Array of User IDs
}

/**
 * Area list item (for dropdowns/lists)
 */
export interface AreaListItem {
  id: string;
  name: string;
  code: string;
  department_id: string;
  department_name: string;
  is_active: boolean;
  manager_name: string | null;
  parent_area_name: string | null;
}

/**
 * Area with extended information
 */
export interface AreaDetail extends Area {
  parent_area_name: number;
  manager_details: {
    id: number;
    full_name: string;
    email: string;
    phone: string | null;
  } | null;
  responsible_users_details: Array<{
    id: number;
    full_name: string;
    email: string;
    phone: string | null;
  }>;
  child_areas: AreaListItem[];
  resources: AreaResource[];
}

/**
 * Area resource (equipment, facilities, etc.)
 */
export interface AreaResource {
  id: string;
  name: string;
  type: string;
  description: string | null;
  quantity: number;
  is_available: boolean;
  last_maintenance: string | null; // ISO 8601 date string
  next_maintenance: string | null; // ISO 8601 date string
  status: 'OPERATIONAL' | 'MAINTENANCE' | 'OUT_OF_ORDER';
}

/**
 * Data needed to create a new area
 */
export interface CreateAreaData {
  name: string;
  code: string;
  description?: string;
  department: string; // Department ID
  parent_area?: string | null;
  manager?: number | null;
  floor?: string | null;
  room?: string | null;
  capacity?: number | null;
  contact_email?: string | null;
  contact_phone?: string | null;
  working_hours?: string | null;
  responsible_users?: number[];
}

/**
 * Data needed to update an area
 */
export type UpdateAreaData = Partial<Omit<CreateAreaData, 'code' | 'department'>> & {
  is_active?: boolean;
  add_responsible_users?: number[];
  remove_responsible_users?: number[];
};

/**
 * Area statistics
 */
export interface AreaStats {
  total_areas: number;
  active_areas: number;
  by_department: Record<string, number>;
  by_type: Record<string, number>;
  average_resources_per_area: number;
  maintenance_required: number;
}

/**
 * Area filter options
 */
export interface AreaFilterOptions {
  department?: string[];
  is_active?: boolean;
  has_manager?: boolean;
  search?: string;
  sort_by?: 'name' | 'code' | 'department' | 'manager';
  sort_order?: 'asc' | 'desc';
  page?: number;
  page_size?: number;
}
