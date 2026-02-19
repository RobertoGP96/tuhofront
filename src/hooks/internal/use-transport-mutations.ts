import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { TransportProcedure } from '../../types/internal/transport';
import { internalProceduresService } from '../../services/internal';

export function useTransportMutations() {
  const qc = useQueryClient();

  const create = useMutation<TransportProcedure, Error, TransportProcedure, unknown>({
    mutationFn: (data: TransportProcedure) => internalProceduresService.createTransportProcedure(data),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['transport-procedures'] }),
  });

  const update = useMutation<TransportProcedure, Error, { id: number; data: TransportProcedure }, unknown>({
    mutationFn: ({ id, data }) => internalProceduresService.updateTransportProcedure(id, data),
    onSuccess: (_data, vars) => {
      void qc.invalidateQueries({ queryKey: ['transport-procedures'] });
      void qc.invalidateQueries({ queryKey: ['transport-procedure', vars.id] });
    },
  });

  const patch = useMutation<TransportProcedure, Error, { id: number; data: Partial<TransportProcedure> }, unknown>({
    mutationFn: ({ id, data }) => internalProceduresService.patchTransportProcedure(id, data),
    onSuccess: (_data, vars) => {
      void qc.invalidateQueries({ queryKey: ['transport-procedures'] });
      void qc.invalidateQueries({ queryKey: ['transport-procedure', vars.id] });
    },
  });

  const remove = useMutation<void, Error, number, unknown>({
    mutationFn: (id: number) => internalProceduresService.deleteTransportProcedure(id),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['transport-procedures'] }),
  });

  return { create, update, patch, remove };
}

export default useTransportMutations;
