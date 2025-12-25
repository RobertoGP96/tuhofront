import { apiClient } from '../api';
import type {
  Role,
  CreateRoleData,
  UpdateRoleData,
  Permission
} from '../../types/platform/platform';
import type { ApiResponse, PaginatedResponse } from '../api/client';

// Endpoints de roles
const ROLE_ENDPOINTS = {
  ROLES: '/platform/roles/',
  PERMISSIONS: '/platform/permissions/',
  ROLE_PERMISSIONS: '/platform/roles/:id/permissions/',
} as const;

class RoleService {
  /**
   * Obtener lista de roles
   */
  async getRoles(page = 1, pageSize = 50): Promise<PaginatedResponse<Role>> {
    const params = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString(),
    });

    const response = await apiClient.get<ApiResponse<PaginatedResponse<Role>>>(
      `${ROLE_ENDPOINTS.ROLES}?${params}`
    );

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.message || 'Error al obtener roles');
  }

  /**
   * Obtener todos los roles (sin paginación)
   */
  async getAllRoles(): Promise<Role[]> {
    const response = await apiClient.get<ApiResponse<Role[]>>(
      `${ROLE_ENDPOINTS.ROLES}all/`
    );

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.message || 'Error al obtener roles');
  }

  /**
   * Obtener un rol por ID
   */
  async getRoleById(id: number): Promise<Role> {
    const response = await apiClient.get<ApiResponse<Role>>(
      `${ROLE_ENDPOINTS.ROLES}${id}/`
    );

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.message || 'Error al obtener rol');
  }

  /**
   * Crear un nuevo rol
   */
  async createRole(data: CreateRoleData): Promise<Role> {
    const response = await apiClient.post<ApiResponse<Role>>(
      ROLE_ENDPOINTS.ROLES,
      data
    );

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.message || 'Error al crear rol');
  }

  /**
   * Actualizar un rol
   */
  async updateRole(id: number, data: UpdateRoleData): Promise<Role> {
    const response = await apiClient.patch<ApiResponse<Role>>(
      `${ROLE_ENDPOINTS.ROLES}${id}/`,
      data
    );

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.message || 'Error al actualizar rol');
  }

  /**
   * Eliminar un rol
   */
  async deleteRole(id: number): Promise<void> {
    const response = await apiClient.delete<ApiResponse<null>>(
      `${ROLE_ENDPOINTS.ROLES}${id}/`
    );

    if (!response.success) {
      throw new Error(response.message || 'Error al eliminar rol');
    }
  }

  /**
   * Obtener todos los permisos disponibles
   */
  async getPermissions(): Promise<Permission[]> {
    const response = await apiClient.get<ApiResponse<Permission[]>>(
      ROLE_ENDPOINTS.PERMISSIONS
    );

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.message || 'Error al obtener permisos');
  }

  /**
   * Asignar permisos a un rol
   */
  async assignPermissions(roleId: number, permissionIds: number[]): Promise<void> {
    const endpoint = ROLE_ENDPOINTS.ROLE_PERMISSIONS.replace(':id', roleId.toString());
    const response = await apiClient.post<ApiResponse<null>>(endpoint, {
      permissions: permissionIds
    });

    if (!response.success) {
      throw new Error(response.message || 'Error al asignar permisos');
    }
  }

  /**
   * Remover permisos de un rol
   */
  async removePermissions(roleId: number, permissionIds: number[]): Promise<void> {
    const endpoint = ROLE_ENDPOINTS.ROLE_PERMISSIONS.replace(':id', roleId.toString());
    const response = await apiClient.delete<ApiResponse<null>>(endpoint, {
      data: { permissions: permissionIds }
    });

    if (!response.success) {
      throw new Error(response.message || 'Error al remover permisos');
    }
  }

  /**
   * Activar/desactivar rol
   */
  async toggleRoleStatus(id: number, isActive: boolean): Promise<void> {
    const response = await apiClient.patch<ApiResponse<null>>(
      `${ROLE_ENDPOINTS.ROLES}${id}/`,
      { is_active: isActive }
    );

    if (!response.success) {
      throw new Error(response.message || 'Error al cambiar estado del rol');
    }
  }
}

// Instancia singleton del servicio de roles
export const roleService = new RoleService();

// Export default para compatibilidad
export default roleService;