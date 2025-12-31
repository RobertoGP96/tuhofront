import { apiClient } from '@/lib/client';
import type { 
  LoginCredentials, 
  RegisterData, 
  AuthResponse, 
  TokenRefreshResponse,
  PasswordResetRequest,
  User
} from '@/types/users/auth';

// Endpoints de autenticación
const AUTH_ENDPOINTS = {
  LOGIN: '/v1/auth/login/',
  REGISTER: '/v1/auth/register/',
  REFRESH: '/v1/auth/token/refresh/',
  LOGOUT: '/v1/auth/logout/',
  PROFILE: '/v1/auth/profile/',
  VERIFY_TOKEN: '/v1/auth/verify/',
  RESET_PASSWORD: '/v1/auth/reset-password/',
} as const;

class AuthService {
  /**
   * Iniciar sesión
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    // El backend espera 'username' pero LoginCredentials tiene 'email'
    // Usamos el email como username
    const response = await apiClient.post<AuthResponse>(
      AUTH_ENDPOINTS.LOGIN,
      {
        username: credentials.email,
        password: credentials.password
      }
    );
    
    // El backend devuelve directamente { user, access, refresh, message }
    if (response.access) {
      // Configurar token en el cliente API
      apiClient.setAuthToken(response.access);
      
      // Guardar tokens y usuario en localStorage
      const authData = {
        user: response.user,
        token: response.access,
        refresh: response.refresh
      };
      localStorage.setItem('tuhofront_auth', JSON.stringify(authData));
      
      return response;
    }
    
    throw new Error('Error al iniciar sesión');
  }

  /**
   * Registrar nuevo usuario
   */
  async register(userData: RegisterData): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>(
      AUTH_ENDPOINTS.REGISTER,
      userData
    );
    
    return response;
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
    }
  }

  /**
   * Obtener información del usuario actual
   */
  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<{ user: User }>(AUTH_ENDPOINTS.PROFILE);
    
    if (response.user) {
      return response.user;
    }
    
    throw new Error('Error al obtener información del usuario');
  }

  /**
   * Refrescar token de acceso
   */
  async refreshToken(refreshToken: string): Promise<TokenRefreshResponse> {
    const response = await apiClient.post<TokenRefreshResponse>(
      AUTH_ENDPOINTS.REFRESH,
      { refresh: refreshToken }
    );
    
    // El backend devuelve directamente { access }
    if (response.access) {
      // Actualizar token en el cliente API
      apiClient.setAuthToken(response.access);
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

  /**
   * Verificar token de activación
   */
  async verifyToken(token: string): Promise<{ message: string }> {
    const response = await apiClient.get<{ message: string }>(
      `/v1/auth/verify/${token}/`
    );
    
    return response;
  }

}

// Instancia singleton del servicio de autenticación
export const authService = new AuthService();

// Export default para compatibilidad
export default authService;