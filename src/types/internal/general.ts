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
  user: number | null; // Usuario id
  document?: string | null; // URL o path del archivo
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