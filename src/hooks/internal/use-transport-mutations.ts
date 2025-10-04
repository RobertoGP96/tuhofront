import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { TransportProcedure } from '../../types/internal/transport';
import {
  createTransportProcedure,
  updateTransportProcedure,
  patchTransportProcedure,
  deleteTransportProcedure,
} from '../../services/internal/internal.procedures.api';

export function useTransportMutations() {
  const qc = useQueryClient();

  const create = useMutation<TransportProcedure, Error, TransportProcedure, unknown>({
    mutationFn: (data: TransportProcedure) => createTransportProcedure(data).then(r => r.data),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['transport-procedures'] }),
  });

  const update = useMutation<TransportProcedure, Error, { id: number; data: TransportProcedure }, unknown>({
    mutationFn: ({ id, data }) => updateTransportProcedure(id, data).then(r => r.data),
    onSuccess: (_data, vars) => {
      void qc.invalidateQueries({ queryKey: ['transport-procedures'] });
      void qc.invalidateQueries({ queryKey: ['transport-procedure', vars.id] });
    },
  });

  const patch = useMutation<TransportProcedure, Error, { id: number; data: Partial<TransportProcedure> }, unknown>({
    mutationFn: ({ id, data }) => patchTransportProcedure(id, data).then(r => r.data),
    onSuccess: (_data, vars) => {
      void qc.invalidateQueries({ queryKey: ['transport-procedures'] });
      void qc.invalidateQueries({ queryKey: ['transport-procedure', vars.id] });
    },
  });

  const remove = useMutation<void, Error, number, unknown>({
    mutationFn: (id: number) => deleteTransportProcedure(id).then(r => r.data),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['transport-procedures'] }),
  });

  return { create, update, patch, remove };
}

export default useTransportMutations;
