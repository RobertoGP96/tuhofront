import { useQuery } from '@tanstack/react-query';
import type { FeedingProcedure } from '../../types/internal/feeding';
import { internalProceduresService } from '../../services/internal';

export function useFeedingProcedures() {
  const { data, isLoading, isError, refetch } = useQuery<FeedingProcedure[], Error, FeedingProcedure[]>({
    queryKey: ['feeding-procedures'],
    queryFn: () => internalProceduresService.getAllFeedingProcedures().then(r => r.results),
  });

  return {
    feedingProcedures: data ?? ([] as FeedingProcedure[]),
    isLoading,
    isError: Boolean(isError),
    refetch,
  };
}

export function useFeedingProcedure(id?: number) {
  const { data, isLoading, isError, refetch } = useQuery<FeedingProcedure, Error, FeedingProcedure>({
    queryKey: ['feeding-procedure', id],
    enabled: Boolean(id),
    queryFn: () => internalProceduresService.getFeedingProcedure(id as number),
  });

  return {
    feedingProcedure: data ?? (null as unknown as FeedingProcedure),
    isLoading,
    isError: Boolean(isError),
    refetch,
  };
}

export default useFeedingProcedures;
