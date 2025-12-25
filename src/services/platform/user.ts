import { apiClient } from '../api';
import type {
  PlatformUser,
  CreateUserData,
  UpdateUserData,
  UserFilters
} from '../../types/platform/platform';
import type { PaginatedResponse } from '../api/client';

// Endpoints de usuarios
const USER_ENDPOINTS = {
  USERS: '/v1/usuarios/',
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

    const response = await apiClient.get<PaginatedResponse<PlatformUser>>(
      `${USER_ENDPOINTS.USERS}?${params}`
    );

    return response;
  }

  /**
   * Obtener un usuario por ID
   */
  async getUserById(id: number): Promise<PlatformUser> {
    const response = await apiClient.get<PlatformUser>(
      `${USER_ENDPOINTS.USERS}${id}/`
    );

    return response;
  }

  /**
   * Crear un nuevo usuario
   */
  async createUser(data: CreateUserData): Promise<PlatformUser> {
    const response = await apiClient.post<PlatformUser>(
      USER_ENDPOINTS.USERS,
      data
    );

    return response;
  }

  /**
   * Actualizar un usuario
   */
  async updateUser(id: number, data: UpdateUserData): Promise<PlatformUser> {
    const response = await apiClient.patch<PlatformUser>(
      `${USER_ENDPOINTS.USERS}${id}/`,
      data
    );

    return response;
  }

  /**
   * Eliminar un usuario
   */
  async deleteUser(id: number): Promise<void> {
    await apiClient.delete(`${USER_ENDPOINTS.USERS}${id}/`);
  }

  /**
   * Activar/desactivar usuario
   */
  async toggleUserStatus(id: number, isActive: boolean): Promise<PlatformUser> {
    const response = await apiClient.patch<PlatformUser>(
      `${USER_ENDPOINTS.USERS}${id}/`,
      { is_active: isActive }
    );

    return response;
  }
}

// Instancia singleton del servicio de usuarios
export const userService = new UserService();

// Export default para compatibilidad
export default userService;