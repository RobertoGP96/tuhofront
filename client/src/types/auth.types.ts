
export type UserRole = 'ADMIN' | 'SECRETARIA_DOCENTE' | 'PROFESOR' | 'TRABAJADOR' | 'ESTUDIANTE' | 'EXTERNO';

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
  { value: 'EXTERNO', label: 'Externo' },
  { value: 'ESTUDIANTE', label: 'Estudiante' },
  { value: 'PROFESOR', label: 'Profesor' },
  { value: 'TRABAJADOR', label: 'Trabajador' },
  { value: 'SECRETARIA_DOCENTE', label: 'Secretaría Docente' },
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
