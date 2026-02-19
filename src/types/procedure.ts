export const ProcedureState = {
  PENDING: 'PENDIENTE',
  IN_PROGRESS: 'EN_PROCESO',
  APPROVED: 'APROBADO',
  REJECTED: 'RECHAZADO',
  COMPLETED: 'COMPLETADO',
} as const;

export type ProcedureStateType = typeof ProcedureState[keyof typeof ProcedureState];

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface ProcedureFilterParams {
  search?: string;
  status?: string;
  type?: string;
  page?: number;
  pageSize?: number;
}
