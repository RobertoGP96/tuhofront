export interface Tramite {
  id: number;
  numero_seguimiento: string;
  tipo_estudio: string;
  tipo_est: string;
  uso: string;
  uso_i: string;
  usuario: number | null; // id del Usuario
  nombre: string;
  apellidos: string;
  ci: string;
  email: string;
  telefono: string;
  tomo: string;
  folio: string;
  numero: string;
  fecha: string; // ISO date string
  estado: string;
  intereses: string;
  organismo?: string | null;
  organismo_op: string;
  motivo?: string | null;
  funcionario: string;
  carrera: string;
  year: string;
  programa_academico: string;
  nombre_programa: string;
  tipo_pren: string;
  tipo_prei: string;
  tipo_posn: string;
  tipo_posi: string;
  legalizacion: string;
  archivo: string; // URL o path del archivo
  nombre_tramite: string;
}

