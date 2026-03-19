import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { ReservationState } from '@/types/locals.types';

const STATE_COLORS: Record<ReservationState, string> = {
  BORRADOR: 'bg-gray-100 text-gray-700 border-gray-200',
  PENDIENTE: 'bg-blue-100 text-blue-700 border-blue-200',
  APROBADA: 'bg-green-100 text-green-700 border-green-200',
  RECHAZADA: 'bg-red-100 text-red-700 border-red-200',
  CANCELADA: 'bg-orange-100 text-orange-700 border-orange-200',
  EN_CURSO: 'bg-amber-100 text-amber-700 border-amber-200',
  FINALIZADA: 'bg-emerald-100 text-emerald-700 border-emerald-200',
};

const STATE_LABELS: Record<ReservationState, string> = {
  BORRADOR: 'Borrador',
  PENDIENTE: 'Pendiente',
  APROBADA: 'Aprobada',
  RECHAZADA: 'Rechazada',
  CANCELADA: 'Cancelada',
  EN_CURSO: 'En Curso',
  FINALIZADA: 'Finalizada',
};

interface ReservationBadgeProps {
  state: ReservationState;
}

export function ReservationBadge({ state }: ReservationBadgeProps) {
  const colorClass = STATE_COLORS[state] ?? 'bg-gray-100 text-gray-700 border-gray-200';
  const label = STATE_LABELS[state] ?? state;
  return (
    <Badge variant="outline" className={cn('font-medium', colorClass)}>
      {label}
    </Badge>
  );
}
