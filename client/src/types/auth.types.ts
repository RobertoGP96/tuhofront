
export type UserRole = 'USUARIO' | 'GESTOR_INTERNO' | 'GESTOR_SECRETARIA' | 'GESTOR_RESERVAS' | 'ADMIN';

export type UserType = UserRole;

export interface User {
  id: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  id_card?: string;
  phone?: string;
  address?: string;
  date_of_birth?: string;
  user_type?: UserRole;
  workplace?: string;
  /** Avatar como data URL base64 (`data:image/png;base64,...`) o URL externa. */
  personal_photo?: string;
  role?: 'ADMIN' | 'USER';
  is_staff?: boolean;
  is_active?: boolean;
  email_verified?: boolean;
  phone_verified?: boolean;
  date_joined?: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  password_confirm: string;
  first_name: string;
  last_name: string;
  id_card: string;
  phone?: string;
  address?: string;
  date_of_birth?: string;
  user_type?: UserType;
  workplace?: string;
}

export const USER_TYPE_OPTIONS: { value: UserType; label: string }[] = [
  { value: 'USUARIO', label: 'Usuario' },
  { value: 'GESTOR_INTERNO', label: 'Gestor de Trámites Internos' },
  { value: 'GESTOR_SECRETARIA', label: 'Gestor de Secretaría Docente' },
  { value: 'GESTOR_RESERVAS', label: 'Gestor de Reservas' },
  { value: 'ADMIN', label: 'Administrador' },
];

export interface AuthResponse {
  access: string;
  refresh: string;
  user: User;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
