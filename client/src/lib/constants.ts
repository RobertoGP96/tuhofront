// Procedure state display labels
export const STATE_LABELS: Record<string, string> = {
  BORRADOR: 'Borrador',
  ENVIADO: 'Enviado',
  EN_PROCESO: 'En Proceso',
  REQUIERE_INFO: 'Requiere Info',
  APROBADO: 'Aprobado',
  RECHAZADO: 'Rechazado',
  FINALIZADO: 'Finalizado',
};

// TailwindCSS badge color classes per state (use amber for EN_PROCESO consistently)
export const STATE_COLORS: Record<string, string> = {
  BORRADOR: 'bg-gray-100 text-gray-700 border-gray-200',
  ENVIADO: 'bg-blue-100 text-blue-700 border-blue-200',
  EN_PROCESO: 'bg-amber-100 text-amber-700 border-amber-200',
  REQUIERE_INFO: 'bg-orange-100 text-orange-700 border-orange-200',
  APROBADO: 'bg-green-100 text-green-700 border-green-200',
  RECHAZADO: 'bg-red-100 text-red-700 border-red-200',
  FINALIZADO: 'bg-emerald-100 text-emerald-700 border-emerald-200',
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

// Secretary procedure valid state transitions
export const VALID_TRANSITIONS: Partial<Record<string, string[]>> = {
  ENVIADO: ['EN_PROCESO'],
  EN_PROCESO: ['APROBADO', 'RECHAZADO', 'REQUIERE_INFO'],
  REQUIERE_INFO: ['EN_PROCESO'],
  APROBADO: ['FINALIZADO'],
};

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
