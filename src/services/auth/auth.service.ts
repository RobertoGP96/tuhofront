import { apiClient } from '../api';
import type { 
  LoginCredentials, 
  RegisterData, 
  AuthResponse, 
  TokenRefreshResponse,
  PasswordResetRequest,
  PasswordResetConfirm,
  ChangePasswordData,
  User
} from '../../types/users/auth';
import type { ApiResponse } from '../api/client';

// Endpoints de autenticación
const AUTH_ENDPOINTS = {
  LOGIN: '/auth/login/',
  REGISTER: '/auth/register/',
  REFRESH: '/auth/refresh/',
  LOGOUT: '/auth/logout/',
  ME: '/auth/me/',
  CHANGE_PASSWORD: '/auth/change-password/',
  RESET_PASSWORD: '/auth/reset-password/',
  RESET_PASSWORD_CONFIRM: '/auth/reset-password-confirm/',
  VERIFY_EMAIL: '/auth/verify-email/',
} as const;

class AuthService {
  /**
   * Iniciar sesión
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiClient.post<ApiResponse<AuthResponse>>(
      AUTH_ENDPOINTS.LOGIN,
      credentials
    );
    
    if (response.success && response.data) {
      // Configurar token en el cliente API
      apiClient.setAuthToken(response.data.access);
      return response.data;
    }
    
    throw new Error(response.message || 'Error al iniciar sesión');
  }

  /**
   * Registrar nuevo usuario
   */
  async register(userData: RegisterData): Promise<AuthResponse> {
    const response = await apiClient.post<ApiResponse<AuthResponse>>(
      AUTH_ENDPOINTS.REGISTER,
      userData
    );
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Error al registrar usuario');
  }

  /**
   * Cerrar sesión
   */
  async logout(): Promise<void> {
    try {
      await apiClient.post(AUTH_ENDPOINTS.LOGOUT);
    } catch (error) {
      console.warn('Error al cerrar sesión en el servidor:', error);
    } finally {
      // Limpiar token del cliente API
      apiClient.clearAuthToken();
    }
  }

  /**
   * Obtener información del usuario actual
   */
  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<ApiResponse<User>>(AUTH_ENDPOINTS.ME);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Error al obtener información del usuario');
  }

  /**
   * Refrescar token de acceso
   */
  async refreshToken(refreshToken: string): Promise<TokenRefreshResponse> {
    const response = await apiClient.post<ApiResponse<TokenRefreshResponse>>(
      AUTH_ENDPOINTS.REFRESH,
      { refresh: refreshToken }
    );
    
    if (response.success && response.data) {
      // Actualizar token en el cliente API
      apiClient.setAuthToken(response.data.access);
      return response.data;
    }
    
    throw new Error(response.message || 'Error al refrescar token');
  }

  /**
   * Cambiar contraseña
   */
  async changePassword(passwordData: ChangePasswordData): Promise<void> {
    const response = await apiClient.post<ApiResponse<null>>(
      AUTH_ENDPOINTS.CHANGE_PASSWORD,
      passwordData
    );
    
    if (!response.success) {
      throw new Error(response.message || 'Error al cambiar contraseña');
    }
  }

  /**
   * Solicitar restablecimiento de contraseña
   */
  async requestPasswordReset(data: PasswordResetRequest): Promise<void> {
    const response = await apiClient.post<ApiResponse<null>>(
      AUTH_ENDPOINTS.RESET_PASSWORD,
      data
    );
    
    if (!response.success) {
      throw new Error(response.message || 'Error al solicitar restablecimiento');
    }
  }

  /**
   * Confirmar restablecimiento de contraseña
   */
  async confirmPasswordReset(data: PasswordResetConfirm): Promise<void> {
    const response = await apiClient.post<ApiResponse<null>>(
      AUTH_ENDPOINTS.RESET_PASSWORD_CONFIRM,
      data
    );
    
    if (!response.success) {
      throw new Error(response.message || 'Error al restablecer contraseña');
    }
  }

  /**
   * Verificar email
   */
  async verifyEmail(token: string): Promise<void> {
    const response = await apiClient.post<ApiResponse<null>>(
      AUTH_ENDPOINTS.VERIFY_EMAIL,
      { token }
    );
    
    if (!response.success) {
      throw new Error(response.message || 'Error al verificar email');
    }
  }

  /**
   * Verificar si el token actual es válido
   */
  async verifyToken(): Promise<boolean> {
    try {
      await this.getCurrentUser();
      return true;
    } catch {
      return false;
    }
  }
}

// Instancia singleton del servicio de autenticación
export const authService = new AuthService();

// Export default para compatibilidad
export default authService;