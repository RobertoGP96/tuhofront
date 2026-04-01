export interface Notificacion {
  id: number;
  tipo: string;
  prioridad: string;
  asunto: string;
  cuerpo?: string;
  visto: boolean;
  created_at: string;
  tiempo_transcurrido: string;
  url_accion?: string;
  icono?: string;
  para: number;
}

export interface NotificacionStats {
  total: number;
  sin_leer: number;
  urgentes: number;
  leidas: number;
}

export interface NotificacionListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Notificacion[];
}
