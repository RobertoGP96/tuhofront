export interface TramiteGeneral {
  id: number;
  nombre_tramite: string;
  on_create: string;   // ISO date string
  on_modified: string; // ISO date string
}

export interface EstadosTramites {
  id: number;
  nombre: string;
  is_active: boolean;
}
