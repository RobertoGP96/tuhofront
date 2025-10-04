import { apiClient } from '../api';
import type {
  PlatformUser,
  CreateUserData,
  UpdateUserData,
  UpdateProfileData,
  UserFilters,
  UserStats,
  UserType
} from '../../types/platform/platform';
import type { ApiResponse, PaginatedResponse } from '../api/client';

// Endpoints de usuarios
const USER_ENDPOINTS = {
  USERS: '/platform/users/',
  USER_PROFILE: '/platform/users/:id/profile/',
  USER_ROLES: '/platform/users/:id/roles/',
  USER_STATS: '/platform/users/stats/',
  USER_TYPES: '/platform/user-types/',
  BULK_USERS: '/platform/users/bulk/',
} as const;

class UserService {
  /**
   * Obtener lista de usuarios con filtros y paginación
   */
  async getUsers(
    filters?: UserFilters,
    page = 1,
    pageSize = 10
  ): Promise<PaginatedResponse<PlatformUser>> {
    const params = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString(),
    });

    // Agregar filtros si existen
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });
    }

    const response = await apiClient.get<ApiResponse<PaginatedResponse<PlatformUser>>>(
      `${USER_ENDPOINTS.USERS}?${params}`
    );

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.message || 'Error al obtener usuarios');
  }

  /**
   * Obtener un usuario por ID
   */
  async getUserById(id: number): Promise<PlatformUser> {
    const response = await apiClient.get<ApiResponse<PlatformUser>>(
      `${USER_ENDPOINTS.USERS}${id}/`
    );

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.message || 'Error al obtener usuario');
  }

  /**
   * Crear un nuevo usuario
   */
  async createUser(data: CreateUserData): Promise<PlatformUser> {
    const response = await apiClient.post<ApiResponse<PlatformUser>>(
      USER_ENDPOINTS.USERS,
      data
    );

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.message || 'Error al crear usuario');
  }

  /**
   * Actualizar un usuario
   */
  async updateUser(id: number, data: UpdateUserData): Promise<PlatformUser> {
    const response = await apiClient.patch<ApiResponse<PlatformUser>>(
      `${USER_ENDPOINTS.USERS}${id}/`,
      data
    );

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.message || 'Error al actualizar usuario');
  }

  /**
   * Eliminar un usuario
   */
  async deleteUser(id: number): Promise<void> {
    const response = await apiClient.delete<ApiResponse<null>>(
      `${USER_ENDPOINTS.USERS}${id}/`
    );

    if (!response.success) {
      throw new Error(response.message || 'Error al eliminar usuario');
    }
  }

  /**
   * Actualizar perfil de usuario
   */
  async updateProfile(userId: number, data: UpdateProfileData): Promise<void> {
    let response: ApiResponse<null>;

    if (data.avatar) {
      // Si hay avatar, usar FormData
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (key === 'avatar' && value instanceof File) {
          formData.append(key, value);
        } else if (key === 'preferences' && value) {
          formData.append(key, JSON.stringify(value));
        } else if (value !== undefined && value !== null) {
          formData.append(key, value.toString());
        }
      });

      const endpoint = USER_ENDPOINTS.USER_PROFILE.replace(':id', userId.toString());
      response = await apiClient.upload<ApiResponse<null>>(endpoint, formData);
    } else {
      // Sin avatar, usar JSON
      const endpoint = USER_ENDPOINTS.USER_PROFILE.replace(':id', userId.toString());
      response = await apiClient.patch<ApiResponse<null>>(endpoint, data);
    }

    if (!response.success) {
      throw new Error(response.message || 'Error al actualizar perfil');
    }
  }

  /**
   * Asignar roles a un usuario
   */
  async assignRoles(userId: number, roleIds: number[]): Promise<void> {
    const endpoint = USER_ENDPOINTS.USER_ROLES.replace(':id', userId.toString());
    const response = await apiClient.post<ApiResponse<null>>(endpoint, { roles: roleIds });

    if (!response.success) {
      throw new Error(response.message || 'Error al asignar roles');
    }
  }

  /**
   * Remover roles de un usuario
   */
  async removeRoles(userId: number, roleIds: number[]): Promise<void> {
    const endpoint = USER_ENDPOINTS.USER_ROLES.replace(':id', userId.toString());
    const response = await apiClient.delete<ApiResponse<null>>(endpoint, {
      data: { roles: roleIds }
    });

    if (!response.success) {
      throw new Error(response.message || 'Error al remover roles');
    }
  }

  /**
   * Obtener estadísticas de usuarios
   */
  async getUserStats(): Promise<UserStats> {
    const response = await apiClient.get<ApiResponse<UserStats>>(
      USER_ENDPOINTS.USER_STATS
    );

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.message || 'Error al obtener estadísticas');
  }

  /**
   * Obtener tipos de usuario disponibles
   */
  async getUserTypes(): Promise<UserType[]> {
    const response = await apiClient.get<ApiResponse<UserType[]>>(
      USER_ENDPOINTS.USER_TYPES
    );

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.message || 'Error al obtener tipos de usuario');
  }

  /**
   * Activar/desactivar usuario
   */
  async toggleUserStatus(id: number, isActive: boolean): Promise<void> {
    const response = await apiClient.patch<ApiResponse<null>>(
      `${USER_ENDPOINTS.USERS}${id}/`,
      { is_active: isActive }
    );

    if (!response.success) {
      throw new Error(response.message || 'Error al cambiar estado del usuario');
    }
  }

  /**
   * Buscar usuarios por término
   */
  async searchUsers(query: string, limit = 10): Promise<PlatformUser[]> {
    const params = new URLSearchParams({
      search: query,
      limit: limit.toString(),
    });

    const response = await apiClient.get<ApiResponse<PlatformUser[]>>(
      `${USER_ENDPOINTS.USERS}search/?${params}`
    );

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.message || 'Error al buscar usuarios');
  }

  /**
   * Crear usuarios en lote
   */
  async createBulkUsers(users: CreateUserData[]): Promise<{ created: number; errors: any[] }> {
    const response = await apiClient.post<ApiResponse<{ created: number; errors: any[] }>>(
      USER_ENDPOINTS.BULK_USERS,
      { users }
    );

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.message || 'Error al crear usuarios en lote');
  }
}

// Instancia singleton del servicio de usuarios
export const userService = new UserService();

// Export default para compatibilidad
export default userService;