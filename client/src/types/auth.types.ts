
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
  user_type?: string;
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
  user_type?: string;
  workplace?: string;
}

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
