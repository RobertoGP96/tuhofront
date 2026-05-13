import { useState } from 'react';
import { Download, FileText, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { STATE_LABELS } from '@/lib/constants';
import type { ReportFilters } from '@/services/reports.service';

const NONE = '__none__';

interface ExportReportButtonProps {
  onExport: (filters: ReportFilters) => Promise<void>;
  label?: string;
  /** Lista de opciones para el filtro "Tipo". Si se omite, el campo no se muestra. */
  typeOptions?: { value: string; label: string }[];
  /** Oculta el filtro de estado. */
  hideStateFilter?: boolean;
  size?: 'sm' | 'default' | 'lg';
  variant?: 'default' | 'outline' | 'secondary';
  className?: string;
}

export function ExportReportButton({
  onExport,
  label = 'Exportar PDF',
  typeOptions,
  hideStateFilter = false,
  size = 'sm',
  variant = 'outline',
  className,
}: ExportReportButtonProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<ReportFilters>({});

  function update<K extends keyof ReportFilters>(key: K, value: ReportFilters[K] | undefined) {
    setFilters((prev) => ({ ...prev, [key]: value || undefined }));
  }

  async function handleExport() {
    setLoading(true);
    try {
      await onExport(filters);
      toast.success('Reporte generado correctamente');
      setOpen(false);
    } catch (err) {
      const status = (err as { response?: { status?: number } } | undefined)?.response?.status;
      if (status === 403) {
        toast.error('No tienes permiso para generar este reporte.');
      } else {
        toast.error('No se pudo generar el reporte. Inténtalo de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setFilters({});
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={variant}
          size={size}
          className={className}
          aria-label={label}
        >
          <FileText size={14} className="mr-1.5" />
          {label}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-4 space-y-3">
        <div>
          <h4 className="text-sm font-bold text-primary-navy uppercase tracking-wide">
            Filtros del reporte
          </h4>
          <p className="text-xs text-gray-400 mt-0.5">
            Todos los filtros son opcionales.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label htmlFor="date_from" className="text-xs">Desde</Label>
            <Input
              id="date_from"
              type="date"
              value={filters.dateFrom ?? ''}
              onChange={(e) => update('dateFrom', e.target.value)}
              className="h-9"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="date_to" className="text-xs">Hasta</Label>
            <Input
              id="date_to"
              type="date"
              value={filters.dateTo ?? ''}
              onChange={(e) => update('dateTo', e.target.value)}
              className="h-9"
            />
          </div>
        </div>

        {!hideStateFilter && (
          <div className="space-y-1">
            <Label className="text-xs">Estado</Label>
            <Select
              value={filters.state ?? NONE}
              onValueChange={(v) => update('state', v === NONE ? undefined : v)}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Cualquiera" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE}>Cualquiera</SelectItem>
                {Object.entries(STATE_LABELS).map(([value, lbl]) => (
                  <SelectItem key={value} value={value}>{lbl}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {typeOptions && typeOptions.length > 0 && (
          <div className="space-y-1">
            <Label className="text-xs">Tipo</Label>
            <Select
              value={filters.type ?? NONE}
              onValueChange={(v) => update('type', v === NONE ? undefined : v)}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE}>Todos</SelectItem>
                {typeOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleReset}
            disabled={loading}
          >
            Limpiar
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleExport}
            disabled={loading}
            className="bg-primary-navy text-white hover:bg-primary-navy/90"
          >
            {loading ? (
              <>
                <Loader2 size={14} className="mr-1.5 animate-spin" />
                Generando...
              </>
            ) : (
              <>
                <Download size={14} className="mr-1.5" />
                Descargar PDF
              </>
            )}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
