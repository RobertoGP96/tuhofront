export type Sex = 'M' | 'F';

export interface Guest {
  id?: number;
  name: string;
  sex: Sex;
  identification: string;
}

export interface Area {
  id: number;
  name: string;
}

export interface Department {
  id: number;
  name: string;
  area: Area | null;
}

export type NoteState = 'PENDIENTE' | 'APROBADO' | 'FINALIZADO' | 'CANCELADO' | 'RECHAZADO';

export interface Note {
  id: number;
  state: NoteState;
  description: string;
}

export type ProcedureState = NoteState;

export interface Procedure {
  id?: number;
  user: number | null; // Usuario id
  document?: string | null; // URL o path del archivo
  state: ProcedureState;
  department: Department;
  area: Area;
  notes: Note[];
}


export type ProcedureStats = {
  stats: {
    PENDIENTE: number;
    APROBADO: number;
    CANCELADO: number;
    RECHAZADO: number;
    FINALIZADO: number;
  };
};