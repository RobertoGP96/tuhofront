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
import { proceduresService } from '@/services/procedures.service';
import {
  STATE_LABELS as BASE_STATE_LABELS,
  VALID_STATE_TRANSITIONS,
} from '@/lib/constants';
import type { Procedure, ProcedureState } from '@/types/procedures.types';

const STATE_LABELS = BASE_STATE_LABELS as Record<ProcedureState, string>;

const VALID_TRANSITIONS: Partial<Record<ProcedureState, ProcedureState[]>> =
  VALID_STATE_TRANSITIONS as Partial<Record<ProcedureState, ProcedureState[]>>;

interface ManageProcedureDialogProps {
  procedure: Procedure | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function ManageProcedureDialog({
  procedure,
  open,
  onOpenChange,
  onSuccess,
}: ManageProcedureDialogProps) {
  const [selectedState, setSelectedState] = useState<ProcedureState | ''>('');
  const [observation, setObservation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const availableTransitions = procedure
    ? (VALID_TRANSITIONS[procedure.state] ?? [])
    : [];

  const userName = procedure && procedure.user
    ? `${procedure.user.first_name ?? ''} ${procedure.user.last_name ?? ''}`.trim() ||
      procedure.user.username || '—'
    : '';

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      setSelectedState('');
      setObservation('');
    }
    onOpenChange(nextOpen);
  }

  async function handleSave() {
    if (!procedure) return;

    setIsSubmitting(true);
    try {
      const updatePayload: { state?: ProcedureState; observation?: string } = {};
      if (selectedState) {
        updatePayload.state = selectedState;
      }
      if (observation.trim()) {
        updatePayload.observation = observation.trim();
      }

      if (Object.keys(updatePayload).length > 0) {
        await proceduresService.updateProcedure(procedure.id, updatePayload);
      }

      if (observation.trim()) {
        await proceduresService.createNote({
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

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Gestionar Trámite</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 rounded-lg bg-gray-50 p-3 text-sm">
            <div>
              <span className="text-xs font-semibold uppercase text-gray-400">
                # Seguimiento
              </span>
              <p className="font-medium text-primary-navy">{procedure.follow_number}</p>
            </div>
            <div>
              <span className="text-xs font-semibold uppercase text-gray-400">Solicitante</span>
              <p className="font-medium text-primary-navy">{userName}</p>
            </div>
            <div className="col-span-2">
              <span className="text-xs font-semibold uppercase text-gray-400">Estado actual</span>
              <p className="font-medium text-primary-navy">{STATE_LABELS[procedure.state]}</p>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">
              Cambiar estado
            </label>
            {availableTransitions.length > 0 ? (
              <Select
                value={selectedState}
                onValueChange={(val) => setSelectedState(val as ProcedureState)}
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
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={isSubmitting}>
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
