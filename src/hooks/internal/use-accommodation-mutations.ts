import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { AccommodationProcedure } from '../../types/internal/accomodation';
import {
  createAccommodationProcedure,
  updateAccommodationProcedure,
  patchAccommodationProcedure,
  deleteAccommodationProcedure,
} from '../../services/internal/internal.procedures.api';

export function useAccommodationMutations() {
  const qc = useQueryClient();

  const create = useMutation<AccommodationProcedure, Error, AccommodationProcedure, unknown>({
    mutationFn: (data: AccommodationProcedure) => createAccommodationProcedure(data).then(r => r.data),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['accommodation-procedures'] }),
  });

  const update = useMutation<AccommodationProcedure, Error, { id: number; data: AccommodationProcedure }, unknown>({
    mutationFn: ({ id, data }) => updateAccommodationProcedure(id, data).then(r => r.data),
    onSuccess: (_data, vars) => {
      void qc.invalidateQueries({ queryKey: ['accommodation-procedures'] });
      void qc.invalidateQueries({ queryKey: ['accommodation-procedure', vars.id] });
    },
  });

  const patch = useMutation<AccommodationProcedure, Error, { id: number; data: Partial<AccommodationProcedure> }, unknown>({
    mutationFn: ({ id, data }) => patchAccommodationProcedure(id, data).then(r => r.data),
    onSuccess: (_data, vars) => {
      void qc.invalidateQueries({ queryKey: ['accommodation-procedures'] });
      void qc.invalidateQueries({ queryKey: ['accommodation-procedure', vars.id] });
    },
  });

  const remove = useMutation<void, Error, number, unknown>({
    mutationFn: (id: number) => deleteAccommodationProcedure(id).then(r => r.data),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['accommodation-procedures'] }),
  });

  return { create, update, patch, remove };
}

export default useAccommodationMutations;
