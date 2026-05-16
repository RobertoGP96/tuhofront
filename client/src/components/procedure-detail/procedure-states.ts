/**
 * Configuración de estados y flujos de transición por familia de trámite.
 *
 * Cada familia (secretaría, internos, reservas) tiene un conjunto propio de
 * estados y un orden distinto en el "stepper" que se muestra al usuario. Los
 * mapas de transiciones se usan tanto por el frontend (para deshabilitar
 * opciones inválidas en el dropdown) como en validación cliente.
 *
 * Los labels y colores siguen usando los exports centralizados de
 * `@/lib/constants` para mantener consistencia visual.
 */

import { STATE_LABELS as PROCEDURE_STATE_LABELS, STATE_COLORS as PROCEDURE_STATE_COLORS } from '@/lib/constants';

/**
 * Familia 1: trámites administrativos genéricos (secretaría docente + internos).
 * Comparten el mismo ciclo de vida basado en el modelo Procedure base.
 */
export const PROCEDURE_FLOW: string[] = [
  'BORRADOR',
  'ENVIADO',
  'EN_PROCESO',
  'APROBADO',
  'FINALIZADO',
];

export const PROCEDURE_FLOW_ORDER: Record<string, number> = {
  BORRADOR: 0,
  ENVIADO: 1,
  EN_PROCESO: 2,
  REQUIERE_INFO: 2,
  APROBADO: 3,
  RECHAZADO: 3,
  FINALIZADO: 4,
};

export const PROCEDURE_STATE_LABELS_MAP = PROCEDURE_STATE_LABELS;
export const PROCEDURE_STATE_COLORS_MAP = PROCEDURE_STATE_COLORS;

/**
 * Familia 2: reservas de locales. Ciclo distinto (PENDIENTE, EN_CURSO,
 * FINALIZADA en femenino) y estados extra (CANCELADA).
 */
export const RESERVATION_FLOW: string[] = [
  'BORRADOR',
  'PENDIENTE',
  'APROBADA',
  'EN_CURSO',
  'FINALIZADA',
];

export const RESERVATION_FLOW_ORDER: Record<string, number> = {
  BORRADOR: 0,
  PENDIENTE: 1,
  APROBADA: 2,
  RECHAZADA: 2,
  EN_CURSO: 3,
  CANCELADA: 3,
  FINALIZADA: 4,
};

export const RESERVATION_STATE_LABELS: Record<string, string> = {
  BORRADOR: 'Borrador',
  PENDIENTE: 'Pendiente',
  APROBADA: 'Aprobada',
  RECHAZADA: 'Rechazada',
  CANCELADA: 'Cancelada',
  EN_CURSO: 'En Curso',
  FINALIZADA: 'Finalizada',
};

export const RESERVATION_STATE_COLORS: Record<string, string> = {
  BORRADOR: 'bg-gray-100 text-gray-700 border-gray-200',
  PENDIENTE: 'bg-blue-100 text-blue-700 border-blue-200',
  APROBADA: 'bg-green-100 text-green-700 border-green-200',
  RECHAZADA: 'bg-red-100 text-red-700 border-red-200',
  CANCELADA: 'bg-gray-100 text-gray-500 border-gray-200',
  EN_CURSO: 'bg-amber-100 text-amber-700 border-amber-200',
  FINALIZADA: 'bg-emerald-100 text-emerald-700 border-emerald-200',
};

/** Transiciones válidas para reservas (lado del gestor). */
export const VALID_RESERVATION_TRANSITIONS: Record<string, string[]> = {
  PENDIENTE: ['APROBADA', 'RECHAZADA'],
  APROBADA: ['EN_CURSO', 'CANCELADA'],
  EN_CURSO: ['FINALIZADA'],
};
