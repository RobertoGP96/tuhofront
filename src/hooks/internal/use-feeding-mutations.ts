import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { FeedingProcedure } from '../../types/internal/feeding';
import {
  createFeedingProcedure,
  updateFeedingProcedure,
  patchFeedingProcedure,
  deleteFeedingProcedure,
} from '../../services/internal/internal.procedures.api';

export function useFeedingMutations() {
  const qc = useQueryClient();

  const create = useMutation<FeedingProcedure, Error, FeedingProcedure, unknown>({
    mutationFn: (data: FeedingProcedure) => createFeedingProcedure(data).then(r => r.data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['feeding-procedures'] });
    },
  });

  const update = useMutation<FeedingProcedure, Error, { id: number; data: FeedingProcedure }, unknown>({
    mutationFn: ({ id, data }: { id: number; data: FeedingProcedure }) => updateFeedingProcedure(id, data).then(r => r.data),
    onSuccess: (_data, vars) => {
      void qc.invalidateQueries({ queryKey: ['feeding-procedures'] });
      void qc.invalidateQueries({ queryKey: ['feeding-procedure', vars.id] });
    },
  });

  const patch = useMutation<FeedingProcedure, Error, { id: number; data: Partial<FeedingProcedure> }, unknown>({
    mutationFn: ({ id, data }: { id: number; data: Partial<FeedingProcedure> }) => patchFeedingProcedure(id, data).then(r => r.data),
    onSuccess: (_data, vars) => {
      void qc.invalidateQueries({ queryKey: ['feeding-procedures'] });
      void qc.invalidateQueries({ queryKey: ['feeding-procedure', vars.id] });
    },
  });

  const remove = useMutation<void, Error, number, unknown>({
    mutationFn: (id: number) => deleteFeedingProcedure(id).then(r => r.data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['feeding-procedures'] });
    },
  });

  return { create, update, patch, remove };
}

export default useFeedingMutations;
