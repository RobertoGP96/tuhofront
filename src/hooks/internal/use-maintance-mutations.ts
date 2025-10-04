import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { MaintanceProcedure } from '../../types/internal/mantenice';
import {
  createMaintanceProcedure,
  updateMaintanceProcedure,
  patchMaintanceProcedure,
  deleteMaintanceProcedure,
} from '../../services/internal/internal.procedures.api';

export function useMaintanceMutations() {
  const qc = useQueryClient();

  const create = useMutation<MaintanceProcedure, Error, MaintanceProcedure, unknown>({
    mutationFn: (data: MaintanceProcedure) => createMaintanceProcedure(data).then(r => r.data),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['maintance-procedures'] }),
  });

  const update = useMutation<MaintanceProcedure, Error, { id: number; data: MaintanceProcedure }, unknown>({
    mutationFn: ({ id, data }) => updateMaintanceProcedure(id, data).then(r => r.data),
    onSuccess: (_data, vars) => {
      void qc.invalidateQueries({ queryKey: ['maintance-procedures'] });
      void qc.invalidateQueries({ queryKey: ['maintance-procedure', vars.id] });
    },
  });

  const patch = useMutation<MaintanceProcedure, Error, { id: number; data: Partial<MaintanceProcedure> }, unknown>({
    mutationFn: ({ id, data }) => patchMaintanceProcedure(id, data).then(r => r.data),
    onSuccess: (_data, vars) => {
      void qc.invalidateQueries({ queryKey: ['maintance-procedures'] });
      void qc.invalidateQueries({ queryKey: ['maintance-procedure', vars.id] });
    },
  });

  const remove = useMutation<void, Error, number, unknown>({
    mutationFn: (id: number) => deleteMaintanceProcedure(id).then(r => r.data),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['maintance-procedures'] }),
  });

  return { create, update, patch, remove };
}

export default useMaintanceMutations;
