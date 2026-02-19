export type Sex = 'M' | 'F';

export interface Guest {
  id?: number;
  name: string;
  sex: Sex;
  identification: string;
}

export interface InternalArea {
  id: number;
  name: string;
}

export interface InternalDepartment {
  id: number;
  name: string;
  area: InternalArea | null;
}

export type NoteState = 'PENDIENTE' | 'APROBADO' | 'FINALIZADO' | 'CANCELADO' | 'RECHAZADO';

export interface Note {
  id: number;
  state: NoteState;
  description: string;
}

export type InternalProcedureState = NoteState;

export interface InternalProcedure {
  id?: number;
  user: number | null;
  document?: string | null;
  state: InternalProcedureState;
  department: InternalDepartment;
  area: InternalArea;
  notes: Note[];
}

export type InternalProcedureStats = {
  stats: {
    PENDIENTE: number;
    APROBADO: number;
    CANCELADO: number;
    RECHAZADO: number;
    FINALIZADO: number;
  };
};

export interface Area {
  id: number;
  name: string;
  code?: string;
  description?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Department {
  id: number;
  name: string;
  code?: string;
  description?: string;
  area?: Area | null;
  parent_department?: Department | null;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Procedure {
  id: number;
  numero_seguimiento: string;
  user: number;
  state: string;
  observation?: string;
  created_at: string;
  updated_at: string;
  deadline?: string;
}

export interface ProcedureStats {
  total: number;
  pendiente: number;
  en_proceso: number;
  aprobado: number;
  rechazado: number;
  completado: number;
}
