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
  token_activacion: string;
  carnet: string;
  telefono: string;
  direccion: string;
}
