import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { internalAdminService } from '@/services/internal-admin.service';
import type {
  AdminBaseProcedure,
  InternalProcedureState,
  InternalProcedureType,
} from '@/types/internal.types';
import {
  STATE_LABELS,
  STATE_BADGE_CLASSES,
  VALID_TRANSITIONS,
  formatDate,
} from './constants';

interface ManageInternalProcedureDialogProps {
  procedure: AdminBaseProcedure | null;
  procedureType: InternalProcedureType;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  /** Optional extra detail rows rendered inside the dialog */
  renderDetails?: (proc: AdminBaseProcedure) => React.ReactNode;
}

async function dispatchUpdate(
  type: InternalProcedureType,
  id: number,
  state: InternalProcedureState,
): Promise<void> {
  switch (type) {
    case 'feeding':
      await internalAdminService.updateFeedingProcedure(id, { state });
      break;
    case 'accommodation':
      await internalAdminService.updateAccommodationProcedure(id, { state });
      break;
    case 'transport':
      await internalAdminService.updateTransportProcedure(id, { state });
      break;
    case 'maintenance':
      await internalAdminService.updateMaintenanceProcedure(id, { state });
      break;
  }
}

export function ManageInternalProcedureDialog({
  procedure,
  procedureType,
  open,
  onOpenChange,
  onSuccess,
  renderDetails,
}: ManageInternalProcedureDialogProps) {
  const [selectedState, setSelectedState] = useState<InternalProcedureState | ''>('');
  const [observation, setObservation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const availableTransitions = procedure
    ? (VALID_TRANSITIONS[procedure.state] ?? [])
    : [];

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      setSelectedState('');
      setObservation('');
    }
    onOpenChange(nextOpen);
  }

  async function handleSave() {
    if (!procedure) return;
    if (!selectedState && !observation.trim()) return;

    setIsSubmitting(true);
    try {
      if (selectedState) {
        await dispatchUpdate(procedureType, procedure.id, selectedState);
      }

      if (observation.trim()) {
        await internalAdminService.createNote({
          procedure: procedure.id,
          content: observation.trim(),
        });
      }

      toast.success('Trámite actualizado correctamente.');
      onSuccess();
      handleOpenChange(false);
    } catch {
      toast.error('Error al actualizar el trámite. Intente nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!procedure) return null;

  const currentBadgeClass =
    STATE_BADGE_CLASSES[procedure.state] ?? 'bg-gray-100 text-gray-700 border-gray-200';

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Gestionar Trámite Interno</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-lg bg-gray-50 p-3 text-sm space-y-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-xs font-semibold uppercase text-gray-400">Solicitante</span>
                <p className="font-medium text-primary-navy">{procedure.username}</p>
              </div>
              <div>
                <span className="text-xs font-semibold uppercase text-gray-400">Fecha</span>
                <p className="font-medium text-primary-navy">{formatDate(procedure.created_at)}</p>
              </div>
              <div className="col-span-2">
                <span className="text-xs font-semibold uppercase text-gray-400">Estado actual</span>
                <div className="mt-0.5">
                  <Badge variant="outline" className={cn('font-medium', currentBadgeClass)}>
                    {STATE_LABELS[procedure.state]}
                  </Badge>
                </div>
              </div>
            </div>

            {renderDetails && (
              <div className="border-t border-gray-200 pt-2">
                {renderDetails(procedure)}
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Cambiar estado</label>
            {availableTransitions.length > 0 ? (
              <Select
                value={selectedState}
                onValueChange={(val) => setSelectedState(val as InternalProcedureState)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar nuevo estado..." />
                </SelectTrigger>
                <SelectContent>
                  {availableTransitions.map((state) => (
                    <SelectItem key={state} value={state}>
                      {STATE_LABELS[state]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <p className="text-sm text-gray-400">
                No hay transiciones disponibles para este estado.
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">
              Observación / Nota interna
            </label>
            <Textarea
              placeholder="Escriba una observación o nota interna..."
              value={observation}
              onChange={(e) => setObservation(e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSubmitting || (!selectedState && !observation.trim())}
            className="bg-primary-navy hover:bg-primary-navy/90 text-white"
          >
            {isSubmitting ? 'Guardando...' : 'Guardar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
