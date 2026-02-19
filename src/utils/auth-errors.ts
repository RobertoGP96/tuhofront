// Auth error handling utilities

export interface AuthError extends Error {
  status?: number;
  code?: string;
}

export const AUTH_ERROR_CODES = {
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  UNAUTHORIZED: 'UNAUTHORIZED',
  NETWORK_ERROR: 'NETWORK_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
} as const;

export const AUTH_ERROR_MESSAGES = {
  [AUTH_ERROR_CODES.INVALID_CREDENTIALS]: 'Credenciales inválidas. Verifica tu usuario y contraseña.',
  [AUTH_ERROR_CODES.TOKEN_EXPIRED]: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.',
  [AUTH_ERROR_CODES.UNAUTHORIZED]: 'No tienes permisos para acceder a este recurso.',
  [AUTH_ERROR_CODES.NETWORK_ERROR]: 'Error de conexión. Verifica tu conexión a internet.',
  [AUTH_ERROR_CODES.UNKNOWN_ERROR]: 'Ha ocurrido un error inesperado. Intenta nuevamente.',
} as const;

export function createAuthError(code: keyof typeof AUTH_ERROR_CODES, originalError?: Error): AuthError {
  const message = AUTH_ERROR_MESSAGES[code];
  const error: AuthError = new Error(message);
  error.code = code;
  
  if (originalError && 'status' in originalError) {
    error.status = (originalError as any).status;
  }
  
  return error;
}

export function handleAuthError(error: any): AuthError {
  if (error?.response?.status) {
    switch (error.response.status) {
      case 401:
        return createAuthError('INVALID_CREDENTIALS', error);
      case 403:
        return createAuthError('UNAUTHORIZED', error);
      case 422:
        // Token expired or invalid
        return createAuthError('TOKEN_EXPIRED', error);
      default:
        return createAuthError('UNKNOWN_ERROR', error);
    }
  }
  
  if (error?.request) {
    return createAuthError('NETWORK_ERROR', error);
  }
  
  return createAuthError('UNKNOWN_ERROR', error);
}