
export type UserType = 'ESTUDIANTE' | 'PROFESOR' | 'TRABAJADOR' | 'EXTERNO' | 'SECRETARIA_DOCENTE' | 'ADMIN';

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
  user_type?: UserType;
  workplace?: string;
  role: 'admin' | 'user';
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
  { value: 'EXTERNO', label: 'Usuario Externo' },
  { value: 'ESTUDIANTE', label: 'Estudiante' },
  { value: 'PROFESOR', label: 'Profesor' },
  { value: 'TRABAJADOR', label: 'Trabajador' },
  { value: 'SECRETARIA_DOCENTE', label: 'Secretaría Docente' },
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
