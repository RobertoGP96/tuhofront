/**
 * Constantes específicas del panel admin-internal.
 *
 * Las tablas de estado de trámites se centralizaron en `@/lib/constants` para
 * evitar divergencia con el resto de la app; este archivo solo re-exporta y
 * añade las constantes locales del módulo (paginación, fechas).
 */
import type { InternalProcedureState } from '@/types/internal.types';
import {
  STATE_LABELS as BASE_STATE_LABELS,
  STATE_COLORS,
  VALID_STATE_TRANSITIONS,
} from '@/lib/constants';
import { formatDate as formatDateUtil, formatDateTime as formatDateTimeUtil } from '@/utils';

export const STATE_LABELS: Record<InternalProcedureState | 'ALL', string> = {
  ALL: 'Todos los estados',
  ...(BASE_STATE_LABELS as Record<InternalProcedureState, string>),
};

export const STATE_BADGE_CLASSES: Record<InternalProcedureState, string> = STATE_COLORS as Record<
  InternalProcedureState,
  string
>;

export const VALID_TRANSITIONS: Partial<Record<InternalProcedureState, InternalProcedureState[]>> =
  VALID_STATE_TRANSITIONS as Partial<Record<InternalProcedureState, InternalProcedureState[]>>;

export const ALL_STATES = (Object.keys(STATE_LABELS) as Array<InternalProcedureState | 'ALL'>).filter(
  (k): k is InternalProcedureState => k !== 'ALL',
);

export const PAGE_SIZE = 20;

// Re-export desde el helper centralizado (`utils.ts`) para retrocompatibilidad.
export const formatDate = formatDateUtil;
export const formatDateTime = formatDateTimeUtil;
