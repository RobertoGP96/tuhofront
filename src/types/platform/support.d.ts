export interface AtencionPoblacion {
  id: number;
  nombre: string;
  apellidos: string;
  email: string;
  ci: string;
  telefono: string;
  direccion: string;
  municipality: string;
  consulta: string;
  adjunto?: string | null; // URL o path del archivo
  asunto: string;
  mensaje: string;
  usuario: number | null; // id del Usuario
  numero_seguimiento: string; // UUID
  estado: string;
  nombre_tramite: string;
  on_create: string;   // ISO date string
  on_modified: string; // ISO date string
}