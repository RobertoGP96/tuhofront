import { apiClient } from '@/lib/client';
import type { PaginatedResponse } from '@/lib/client';

// Endpoints de roles
// NOTA: Los endpoints de roles/permisos no existen en el backend actual
// Esta implementación es un placeholder para cuando se necesiten
const ROLE_ENDPOINTS = {
  ROLES: '/v1/roles/',
  PERMISSIONS: '/v1/permissions/',
} as const;

export interface Role {
  id: number;
  name: string;
  description?: string;
  permissions?: number[];
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Permission {
  id: number;
  name: string;
  codename: string;
  description?: string;
}

export interface CreateRoleData {
  name: string;
  description?: string;
  permissions?: number[];
}

export interface UpdateRoleData extends Partial<CreateRoleData> {}

class RoleService {
  async getRoles(page = 1, pageSize = 50): Promise<PaginatedResponse<Role>> {
    const params = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString(),
    });

    const response = await apiClient.get<PaginatedResponse<Role>>(
      `${ROLE_ENDPOINTS.ROLES}?${params}`
    );

    return response;
  }

  async getAllRoles(): Promise<Role[]> {
    const response = await apiClient.get<Role[]>(
      ROLE_ENDPOINTS.ROLES
    );

    return response;
  }

  async getRoleById(id: number): Promise<Role> {
    const response = await apiClient.get<Role>(
      `${ROLE_ENDPOINTS.ROLES}${id}/`
    );

    return response;
  }

  async createRole(data: CreateRoleData): Promise<Role> {
    const response = await apiClient.post<Role>(
      ROLE_ENDPOINTS.ROLES,
      data
    );

    return response;
  }

  async updateRole(id: number, data: UpdateRoleData): Promise<Role> {
    const response = await apiClient.patch<Role>(
      `${ROLE_ENDPOINTS.ROLES}${id}/`,
      data
    );

    return response;
  }

  async deleteRole(id: number): Promise<void> {
    await apiClient.delete(`${ROLE_ENDPOINTS.ROLES}${id}/`);
  }

  async getPermissions(): Promise<Permission[]> {
    const response = await apiClient.get<Permission[]>(
      ROLE_ENDPOINTS.PERMISSIONS
    );

    return response;
  }

  async assignPermissions(roleId: number, permissionIds: number[]): Promise<void> {
    await apiClient.post(`${ROLE_ENDPOINTS.ROLES}${roleId}/permissions/`, {
      permissions: permissionIds
    });
  }

  async removePermissions(roleId: number, permissionIds: number[]): Promise<void> {
    await apiClient.delete(`${ROLE_ENDPOINTS.ROLES}${roleId}/permissions/`, {
      data: { permissions: permissionIds }
    });
  }

  async toggleRoleStatus(id: number, isActive: boolean): Promise<Role> {
    const response = await apiClient.patch<Role>(
      `${ROLE_ENDPOINTS.ROLES}${id}/`,
      { is_active: isActive }
    );

    return response;
  }
}

export const roleService = new RoleService();
export default roleService;
