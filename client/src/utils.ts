import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Locale por defecto para todas las fechas/números mostrados al usuario.
 * Centralizado para evitar mezcla de `es-ES` vs `es-CU` por archivo.
 */
export const APP_LOCALE = 'es-CU';

/**
 * Formatea una fecha ISO/string/Date al locale de la app.
 * Devuelve '—' si el valor es null/undefined o no parseable, evitando "Invalid Date".
 */
export function formatDate(
  value: string | number | Date | null | undefined,
  options: Intl.DateTimeFormatOptions = { year: 'numeric', month: '2-digit', day: '2-digit' },
): string {
  if (value === null || value === undefined || value === '') return '—';
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString(APP_LOCALE, options);
}

/**
 * Formatea fecha + hora al locale de la app. Mismo manejo defensivo que `formatDate`.
 */
export function formatDateTime(
  value: string | number | Date | null | undefined,
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  },
): string {
  if (value === null || value === undefined || value === '') return '—';
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString(APP_LOCALE, options);
}

/**
 * Convierte un error de axios contra DRF en un mensaje legible para el usuario.
 * DRF responde 400 con `{ field: ["msg1", "msg2"], ...}` o `{ detail: "msg" }`.
 */
export function parseApiError(error: unknown, fallback = 'Ocurrió un error inesperado'): string {
  const data = (error as { response?: { data?: unknown } })?.response?.data;
  if (typeof data === 'string') return data;
  if (data && typeof data === 'object') {
    const obj = data as Record<string, unknown>;
    if (typeof obj.detail === 'string') return obj.detail;
    const parts: string[] = [];
    for (const [field, value] of Object.entries(obj)) {
      const msg = Array.isArray(value) ? value.join(', ') : String(value);
      parts.push(field === 'non_field_errors' ? msg : `${field}: ${msg}`);
    }
    if (parts.length) return parts.join(' · ');
  }
  const message = (error as { message?: string })?.message;
  return message || fallback;
}

/**
 * Desempaqueta respuestas paginadas o arrays planos del backend de forma defensiva.
 * Útil cuando un endpoint puede devolver `{results, count}` o un array directo.
 */
export function unwrapList<T>(
  res: { results?: unknown; count?: unknown } | unknown,
): { items: T[]; total: number } {
  if (Array.isArray(res)) {
    return { items: res as T[], total: res.length };
  }
  if (res && typeof res === 'object') {
    const obj = res as { results?: unknown; count?: unknown };
    if (Array.isArray(obj.results)) {
      const items = obj.results as T[];
      const total = typeof obj.count === 'number' ? obj.count : items.length;
      return { items, total };
    }
  }
  return { items: [], total: 0 };
}
