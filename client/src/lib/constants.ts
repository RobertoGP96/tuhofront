// Procedure state display labels (compartido por todos los flujos de trámites)
export const STATE_LABELS: Record<string, string> = {
  BORRADOR: 'Borrador',
  ENVIADO: 'Enviado',
  EN_PROCESO: 'En Proceso',
  REQUIERE_INFO: 'Requiere Información',
  APROBADO: 'Aprobado',
  RECHAZADO: 'Rechazado',
  FINALIZADO: 'Finalizado',
};

/**
 * Tokens visuales para badges/pills por estado de trámite.
 * Únicos en toda la app — cualquier vista que muestre estados debe importarlos
 * desde aquí (no redeclararlos inline).
 */
export const STATE_COLORS: Record<string, string> = {
  BORRADOR: 'bg-gray-100 text-gray-700 border-gray-200',
  ENVIADO: 'bg-blue-100 text-blue-700 border-blue-200',
  EN_PROCESO: 'bg-amber-100 text-amber-700 border-amber-200',
  REQUIERE_INFO: 'bg-orange-100 text-orange-700 border-orange-200',
  APROBADO: 'bg-green-100 text-green-700 border-green-200',
  RECHAZADO: 'bg-red-100 text-red-700 border-red-200',
  FINALIZADO: 'bg-emerald-100 text-emerald-700 border-emerald-200',
};

/** Alias mantenido por retrocompatibilidad con código que usaba STATE_BADGE_CLASSES. */
export const STATE_BADGE_CLASSES = STATE_COLORS;

/** Lista ordenada de estados (sin "ALL"). */
export const ALL_STATES = Object.keys(STATE_LABELS) as Array<keyof typeof STATE_LABELS>;

/**
 * Transiciones válidas por estado actual → estados destino permitidos.
 * Centralizado para evitar divergencia entre el flujo de secretaría y el interno.
 */
export const VALID_STATE_TRANSITIONS: Partial<Record<string, string[]>> = {
  ENVIADO: ['EN_PROCESO'],
  EN_PROCESO: ['APROBADO', 'RECHAZADO', 'REQUIERE_INFO'],
  REQUIERE_INFO: ['EN_PROCESO'],
  APROBADO: ['FINALIZADO'],
};

// User type display labels
export const USER_TYPE_LABELS: Record<string, string> = {
  ADMIN: 'Administrador',
  SECRETARIA_DOCENTE: 'Secretaría Docente',
  PROFESOR: 'Profesor',
  TRABAJADOR: 'Trabajador',
  ESTUDIANTE: 'Estudiante',
  EXTERNO: 'Externo',
};

/** @deprecated usar `VALID_STATE_TRANSITIONS`. */
export const VALID_TRANSITIONS = VALID_STATE_TRANSITIONS;

// Notification type labels
export const NOTIFICATION_TYPE_LABELS: Record<string, string> = {
  INFO: 'Información',
  WARNING: 'Advertencia',
  ERROR: 'Error',
  SUCCESS: 'Éxito',
  SYSTEM: 'Sistema',
  ACADEMIC: 'Académico',
  PROCEDURE: 'Trámite',
  MAINTENANCE: 'Mantenimiento',
  URGENT: 'Urgente',
};

// Notification priority labels
export const NOTIFICATION_PRIORITY_LABELS: Record<string, string> = {
  LOW: 'Baja',
  MEDIUM: 'Media',
  HIGH: 'Alta',
  CRITICAL: 'Crítica',
};
