import { apiClient } from '@/lib/client';
import type {
  AuthResponse,
  LoginCredentials,
  PasswordResetRequest,
  RegisterData,
  TokenRefreshResponse,
  UserProfile as User
} from '@/types/user';

// Endpoints de autenticación
const AUTH_ENDPOINTS = {
  LOGIN: '/v1/auth/login/',
  REGISTER: '/v1/auth/register/',
  REFRESH: '/v1/auth/refresh/',
  LOGOUT: '/v1/auth/logout/',
  PROFILE: '/v1/users/me/',
  RESET_PASSWORD: '/v1/auth/reset-password/',
  RESET_PASSWORD_CONFIRM: '/v1/auth/reset-password/confirm/',
} as const;

class AuthService {
  /**
   * Iniciar sesión
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>(
        AUTH_ENDPOINTS.LOGIN,
        credentials,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response?.access) {
        throw new Error('No se recibió un token de acceso válido');
      }

      // Configurar token en el cliente API
      apiClient.setAuthToken(response.access);
      
      return response;
    } catch (error: any) {
      console.error('Error en login:', error);
      let errorMessage = 'Error al iniciar sesión';
      
      if (error.response) {
        if (error.response.data) {
          errorMessage = error.response.data.detail || 
                        error.response.data.message || 
                        JSON.stringify(error.response.data);
        }
        error.status = error.response.status;
      } else if (error.request) {
        errorMessage = 'No se pudo conectar con el servidor';
      }
      
      error.message = errorMessage;
      throw error;
    }
  }

  /**
   * Registrar nuevo usuario
   */
  async register(userData: RegisterData): Promise<{ message: string }> {
    try {
      const response = await apiClient.post<{ message: string }>(
        AUTH_ENDPOINTS.REGISTER,
        userData,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      
      return response;
    } catch (error: any) {
      console.error('Error en registro:', error);
      let errorMessage = 'Error al registrar usuario';
      
      if (error.response) {
        if (error.response.data) {
          errorMessage = error.response.data.detail || 
                        error.response.data.message || 
                        JSON.stringify(error.response.data);
        }
        error.status = error.response.status;
      } else if (error.request) {
        errorMessage = 'No se pudo conectar con el servidor';
      }
      
      error.message = errorMessage;
      throw error;
    }
  }

  /**
   * Cerrar sesión
   */
  async logout(refreshToken?: string): Promise<void> {
    try {
      if (refreshToken) {
        await apiClient.post<{ message: string }>(AUTH_ENDPOINTS.LOGOUT, {
          refresh: refreshToken
        });
      }
    } catch (error) {
      console.warn('Error al cerrar sesión en el servidor:', error);
    } finally {
      // Limpiar token del cliente API
      apiClient.clearAuthToken();
      localStorage.removeItem('tuhofront_auth');
    }
  }

  /**
   * Obtener información del usuario actual
   */
  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<User>(AUTH_ENDPOINTS.PROFILE);
    return response;
  }

  /**
   * Refrescar token de acceso
   */
  async refreshToken(refreshToken: string): Promise<TokenRefreshResponse> {
    const response = await apiClient.post<TokenRefreshResponse>(
      AUTH_ENDPOINTS.REFRESH,
      { refresh: refreshToken }
    );
    
    if (response.access) {
      // Actualizar token en el cliente API
      apiClient.setAuthToken(response.access);
      
      // Actualizar localStorage
      const authData = JSON.parse(localStorage.getItem('tuhofront_auth') || '{}');
      authData.token = response.access;
      if (response.refresh) {
        authData.refresh = response.refresh;
      }
      localStorage.setItem('tuhofront_auth', JSON.stringify(authData));
      
      return response;
    }
    
    throw new Error('Error al refrescar token');
  }

  /**
   * Solicitar restablecimiento de contraseña
   */
  async requestPasswordReset(data: PasswordResetRequest): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>(
      AUTH_ENDPOINTS.RESET_PASSWORD,
      data
    );
    
    return response;
  }
}

// Instancia singleton del servicio de autenticación
export const authService = new AuthService();

// Export default para compatibilidad
export default authService;