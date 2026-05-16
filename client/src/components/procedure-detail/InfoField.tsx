import type { ReactNode } from 'react';

interface InfoFieldProps {
  label: string;
  value: ReactNode;
  className?: string;
}

/**
 * Campo etiqueta + valor utilizado en los Cards de detalle de trámites.
 * Muestra "—" si el valor está vacío.
 */
export function InfoField({ label, value, className }: InfoFieldProps) {
  return (
    <div className={className}>
      <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{label}</p>
      <p className="mt-0.5 text-sm font-medium text-gray-800 break-words">
        {value || value === 0 ? value : '—'}
      </p>
    </div>
  );
}
