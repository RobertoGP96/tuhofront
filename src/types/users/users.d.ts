export interface Usuario {
  id: number;
  username: string;
  password: string;
  email: string;
  first_name: string;
  last_name: string;
  is_staff: boolean;
  is_active: boolean;
  date_joined: string; // ISO date string
  activation_token?: string;
  id_card?: string;
  phone?: string;
  address?: string;
  date_of_birth?: string;
  user_type?: string;
  workplace?: string;
  email_verified?: boolean;
  phone_verified?: boolean;
}
