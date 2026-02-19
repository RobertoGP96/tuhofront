import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { AccommodationProcedure } from '../../types/internal/accomodation';
import { internalProceduresService } from '../../services/internal';

export function useAccommodationMutations() {
  const qc = useQueryClient();

  const create = useMutation<AccommodationProcedure, Error, AccommodationProcedure, unknown>({
    mutationFn: (data: AccommodationProcedure) => internalProceduresService.createAccommodationProcedure(data),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['accommodation-procedures'] }),
  });

  const update = useMutation<AccommodationProcedure, Error, { id: number; data: AccommodationProcedure }, unknown>({
    mutationFn: ({ id, data }) => internalProceduresService.updateAccommodationProcedure(id, data),
    onSuccess: (_data, vars) => {
      void qc.invalidateQueries({ queryKey: ['accommodation-procedures'] });
      void qc.invalidateQueries({ queryKey: ['accommodation-procedure', vars.id] });
    },
  });

  const patch = useMutation<AccommodationProcedure, Error, { id: number; data: Partial<AccommodationProcedure> }, unknown>({
    mutationFn: ({ id, data }) => internalProceduresService.patchAccommodationProcedure(id, data),
    onSuccess: (_data, vars) => {
      void qc.invalidateQueries({ queryKey: ['accommodation-procedures'] });
      void qc.invalidateQueries({ queryKey: ['accommodation-procedure', vars.id] });
    },
  });

  const remove = useMutation<void, Error, number, unknown>({
    mutationFn: (id: number) => internalProceduresService.deleteAccommodationProcedure(id),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['accommodation-procedures'] }),
  });

  return { create, update, patch, remove };
}

export default useAccommodationMutations;
