import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { STATE_LABELS, STATE_COLORS } from '@/lib/constants';

interface StateBadgeProps {
  state: string;
  className?: string;
}

export function StateBadge({ state, className }: StateBadgeProps) {
  const colorClass = STATE_COLORS[state] ?? 'bg-gray-100 text-gray-700 border-gray-200';
  const label = STATE_LABELS[state] ?? state;
  return (
    <Badge variant="outline" className={cn('font-medium', colorClass, className)}>
      {label}
    </Badge>
  );
}
