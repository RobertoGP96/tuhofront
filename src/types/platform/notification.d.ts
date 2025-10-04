export interface Noticias {
  id: number;
  titulo: string;
  imagen_cabecera?: string | null; // URL o path de la imagen
  resumen?: string | null;
  cuerpo: string;
  on_create: string;   // ISO date string
  on_modified: string; // ISO date string
}

export interface Email {
  id: number;
  address: string;
  smtp_server: string;
  smtp_port: string;
  smtp_username: string;
  smtp_password: string;
}

export interface Notificacion {
  id: number;
  tipo: string;
  asunto: string;
  cuerpo: string;
  para: number;        // id del Usuario
  creado: string;      // ISO date string
  visto: boolean;
}
