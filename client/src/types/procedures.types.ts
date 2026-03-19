export type ProcedureState =
  | 'BORRADOR'
  | 'ENVIADO'
  | 'EN_PROCESO'
  | 'REQUIERE_INFO'
  | 'APROBADO'
  | 'RECHAZADO'
  | 'FINALIZADO';

export interface ProcedureUser {
  username: string;
  first_name: string;
  last_name: string;
}

export interface Procedure {
  id: string;
  user: ProcedureUser;
  state: ProcedureState;
  follow_number: string;
  observation: string | null;
  deadline: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProcedureNote {
  id: number;
  procedure: string;
  user: number;
  content: string;
  created_at: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
