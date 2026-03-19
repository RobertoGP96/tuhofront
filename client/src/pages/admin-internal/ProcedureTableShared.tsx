import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, Settings } from 'lucide-react';
import type { AdminBaseProcedure, InternalProcedureState } from '@/types/internal.types';
import { STATE_LABELS, STATE_BADGE_CLASSES, ALL_STATES } from './constants';

// --- State Badge ---

export function StateBadge({ state }: { state: InternalProcedureState }) {
  return (
    <Badge
      variant="outline"
      className={cn('font-medium', STATE_BADGE_CLASSES[state] ?? 'bg-gray-100 text-gray-700')}
    >
      {STATE_LABELS[state] ?? state}
    </Badge>
  );
}

// --- State Filter Select ---

interface StateFilterProps {
  value: InternalProcedureState | 'ALL';
  onChange: (val: InternalProcedureState | 'ALL') => void;
}

export function StateFilter({ value, onChange }: StateFilterProps) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as InternalProcedureState | 'ALL')}>
      <SelectTrigger className="w-full sm:w-56">
        <SelectValue placeholder="Filtrar por estado" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="ALL">{STATE_LABELS.ALL}</SelectItem>
        {ALL_STATES.map((s) => (
          <SelectItem key={s} value={s}>
            {STATE_LABELS[s]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

// --- Table skeleton rows ---

export function TableSkeletonRows({ cols }: { cols: number }) {
  return (
    <>
      {Array.from({ length: 6 }).map((_, i) => (
        <TableRow key={i}>
          {Array.from({ length: cols }).map((__, j) => (
            <TableCell key={j}>
              <Skeleton className="h-4 w-full max-w-[120px]" />
            </TableCell>
          ))}
          <TableCell>
            <Skeleton className="h-8 w-8 ml-auto" />
          </TableCell>
        </TableRow>
      ))}
    </>
  );
}

// --- Manage action button ---

interface ManageBtnProps {
  onClick: () => void;
}

export function ManageBtn({ onClick }: ManageBtnProps) {
  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-8 w-8 text-primary-navy hover:bg-blue-50"
      title="Gestionar trámite"
      onClick={onClick}
    >
      <Settings size={16} />
    </Button>
  );
}

// --- Pagination ---

interface PaginationProps {
  page: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
  onNext: () => void;
  onPrevious: () => void;
}

export function Pagination({
  page,
  totalPages,
  hasNext,
  hasPrevious,
  onNext,
  onPrevious,
}: PaginationProps) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between text-sm text-gray-500 pt-2">
      <span>
        Página {page} de {totalPages}
      </span>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onPrevious}
          disabled={!hasPrevious}
          className="gap-1"
        >
          <ChevronLeft size={14} /> Anterior
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onNext}
          disabled={!hasNext}
          className="gap-1"
        >
          Siguiente <ChevronRight size={14} />
        </Button>
      </div>
    </div>
  );
}

// --- Empty row ---

export function EmptyRow({ colSpan, message }: { colSpan: number; message?: string }) {
  return (
    <TableRow>
      <TableCell colSpan={colSpan} className="py-12 text-center text-gray-400">
        {message ?? 'No se encontraron trámites.'}
      </TableCell>
    </TableRow>
  );
}

// Re-export table primitives for convenience
export { Table, TableBody, TableCell, TableHead, TableHeader, TableRow };

// Generic type helper
export type { AdminBaseProcedure };
