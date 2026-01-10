import type { PaginatedResponse } from '@/lib/client';
import { apiClient } from '@/lib/client';
import type {
    CreateUserData,
    UpdateUserData,
    UserProfile
} from '@/types/user';

// Endpoints de usuarios
const USER_ENDPOINTS = {
  USERS: '/v1/usuarios/',
  ME: '/v1/usuarios/me/',
  LOGIN: '/v1/auth/login/',
} as const;

class UserService {
  /**
   * Obtener lista de usuarios con filtros y paginación
   */
  async getUsers(
    page = 1,
    pageSize = 10,
    filters?: Record<string, any>
  ): Promise<PaginatedResponse<UserProfile>> {
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

    const response = await apiClient.get<PaginatedResponse<UserProfile>>(
      `${USER_ENDPOINTS.USERS}?${params}`
    );

    return response;
  }

  /**
   * Obtener un usuario por ID
   */
  async getUserById(id: number | string): Promise<UserProfile> {
    const response = await apiClient.get<UserProfile>(
      `${USER_ENDPOINTS.USERS}${id}/`
    );

    return response;
  }

  /**
   * Obtener el perfil del usuario actual
   */
  async getCurrentUser(): Promise<UserProfile> {
    const response = await apiClient.get<UserProfile>(USER_ENDPOINTS.ME);
    return response;
  }

  /**
   * Crear un nuevo usuario
   */
  async createUser(data: CreateUserData): Promise<UserProfile> {
    const response = await apiClient.post<UserProfile>(
      USER_ENDPOINTS.USERS,
      data
    );

    return response;
  }

  /**
   * Actualizar un usuario
   */
  async updateUser(id: number | string, data: UpdateUserData): Promise<UserProfile> {
    const response = await apiClient.patch<UserProfile>(
      `${USER_ENDPOINTS.USERS}${id}/`,
      data
    );

    return response;
  }

  /**
   * Eliminar un usuario
   */
  async deleteUser(id: number | string): Promise<void> {
    await apiClient.delete(`${USER_ENDPOINTS.USERS}${id}/`);
  }

  /**
   * Activar/desactivar usuario
   */
  async toggleUserStatus(id: number | string, isActive: boolean): Promise<UserProfile> {
    const response = await apiClient.patch<UserProfile>(
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