import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { FeedingProcedure } from '../../types/internal/feeding';
import { internalProceduresService } from '../../services/internal';

export function useFeedingMutations() {
  const qc = useQueryClient();

  const create = useMutation<FeedingProcedure, Error, FeedingProcedure, unknown>({
    mutationFn: (data: FeedingProcedure) => internalProceduresService.createFeedingProcedure(data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['feeding-procedures'] });
    },
  });

  const update = useMutation<FeedingProcedure, Error, { id: number; data: FeedingProcedure }, unknown>({
    mutationFn: ({ id, data }: { id: number; data: FeedingProcedure }) => internalProceduresService.updateFeedingProcedure(id, data),
    onSuccess: (_data, vars) => {
      void qc.invalidateQueries({ queryKey: ['feeding-procedures'] });
      void qc.invalidateQueries({ queryKey: ['feeding-procedure', vars.id] });
    },
  });

  const patch = useMutation<FeedingProcedure, Error, { id: number; data: Partial<FeedingProcedure> }, unknown>({
    mutationFn: ({ id, data }: { id: number; data: Partial<FeedingProcedure> }) => internalProceduresService.patchFeedingProcedure(id, data),
    onSuccess: (_data, vars) => {
      void qc.invalidateQueries({ queryKey: ['feeding-procedures'] });
      void qc.invalidateQueries({ queryKey: ['feeding-procedure', vars.id] });
    },
  });

  const remove = useMutation<void, Error, number, unknown>({
    mutationFn: (id: number) => internalProceduresService.deleteFeedingProcedure(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['feeding-procedures'] });
    },
  });

  return { create, update, patch, remove };
}

export default useFeedingMutations;
