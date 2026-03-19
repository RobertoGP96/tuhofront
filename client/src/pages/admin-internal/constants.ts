import type { InternalProcedureState } from '@/types/internal.types';

export const STATE_LABELS: Record<InternalProcedureState | 'ALL', string> = {
  ALL: 'Todos los estados',
  BORRADOR: 'Borrador',
  ENVIADO: 'Enviado',
  EN_PROCESO: 'En Proceso',
  REQUIERE_INFO: 'Requiere Información',
  APROBADO: 'Aprobado',
  RECHAZADO: 'Rechazado',
  FINALIZADO: 'Finalizado',
};

export const STATE_BADGE_CLASSES: Record<InternalProcedureState, string> = {
  BORRADOR: 'bg-gray-100 text-gray-700 border-gray-200',
  ENVIADO: 'bg-blue-100 text-blue-700 border-blue-200',
  EN_PROCESO: 'bg-amber-100 text-amber-700 border-amber-200',
  REQUIERE_INFO: 'bg-orange-100 text-orange-700 border-orange-200',
  APROBADO: 'bg-green-100 text-green-700 border-green-200',
  RECHAZADO: 'bg-red-100 text-red-700 border-red-200',
  FINALIZADO: 'bg-emerald-100 text-emerald-700 border-emerald-200',
};

export const VALID_TRANSITIONS: Partial<Record<InternalProcedureState, InternalProcedureState[]>> = {
  ENVIADO: ['EN_PROCESO'],
  EN_PROCESO: ['APROBADO', 'RECHAZADO', 'REQUIERE_INFO'],
  REQUIERE_INFO: ['EN_PROCESO'],
  APROBADO: ['FINALIZADO'],
};

export const ALL_STATES = Object.keys(STATE_LABELS).filter(
  (k) => k !== 'ALL',
) as InternalProcedureState[];

export const PAGE_SIZE = 20;

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('es-CU', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

export function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('es-CU', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}
