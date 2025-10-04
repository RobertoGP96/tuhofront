import { useQuery } from '@tanstack/react-query';
import type { FeedingDays, FeedingProcedure } from '../../types/internal/feeding';
import { getAllFeedingProcedures, getFeedingProcedure } from '../../services/internal/internal.procedures.api';

export function useFeedingProcedures() {
  const { data, isLoading, isError, refetch } = useQuery<FeedingDays[], Error, FeedingDays[]>({
    queryKey: ['feeding-procedures'],
    queryFn: () => getAllFeedingProcedures().then(r => r.data),
  });

  return {
    feedingProcedures: data ?? ([] as FeedingDays[]),
    isLoading,
    isError: Boolean(isError),
    refetch,
  };
}

export function useFeedingProcedure(id?: number) {
  const { data, isLoading, isError, refetch } = useQuery<FeedingProcedure, Error, FeedingProcedure>({
    queryKey: ['feeding-procedure', id],
    enabled: Boolean(id),
    queryFn: () => getFeedingProcedure(id as number).then(r => r.data),
  });

  return {
    feedingProcedure: data ?? (null as unknown as FeedingProcedure),
    isLoading,
    isError: Boolean(isError),
    refetch,
  };
}

export default useFeedingProcedures;
