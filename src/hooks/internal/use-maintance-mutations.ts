import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { MaintanceProcedure } from '../../types/internal/mantenice';
import { internalProceduresService } from '../../services/internal';

export function useMaintanceMutations() {
  const qc = useQueryClient();

  const create = useMutation<MaintanceProcedure, Error, MaintanceProcedure, unknown>({
    mutationFn: (data: MaintanceProcedure) => internalProceduresService.createMaintanceProcedure(data),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['maintance-procedures'] }),
  });

  const update = useMutation<MaintanceProcedure, Error, { id: number; data: MaintanceProcedure }, unknown>({
    mutationFn: ({ id, data }) => internalProceduresService.updateMaintanceProcedure(id, data),
    onSuccess: (_data, vars) => {
      void qc.invalidateQueries({ queryKey: ['maintance-procedures'] });
      void qc.invalidateQueries({ queryKey: ['maintance-procedure', vars.id] });
    },
  });

  const patch = useMutation<MaintanceProcedure, Error, { id: number; data: Partial<MaintanceProcedure> }, unknown>({
    mutationFn: ({ id, data }) => internalProceduresService.patchMaintanceProcedure(id, data),
    onSuccess: (_data, vars) => {
      void qc.invalidateQueries({ queryKey: ['maintance-procedures'] });
      void qc.invalidateQueries({ queryKey: ['maintance-procedure', vars.id] });
    },
  });

  const remove = useMutation<void, Error, number, unknown>({
    mutationFn: (id: number) => internalProceduresService.deleteMaintanceProcedure(id),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['maintance-procedures'] }),
  });

  return { create, update, patch, remove };
}

export default useMaintanceMutations;
