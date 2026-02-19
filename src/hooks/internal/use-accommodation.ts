import { useQuery } from '@tanstack/react-query';
import type { AccommodationProcedure } from '../../types/internal/accomodation';
import { internalProceduresService } from '../../services/internal';

export function useAccommodationProcedures() {
  const { data, isLoading, isError, refetch } = useQuery<AccommodationProcedure[], Error, AccommodationProcedure[]>({
    queryKey: ['accommodation-procedures'],
    queryFn: () => internalProceduresService.getAllAccommodationProcedures().then(r => r.results),
  });

  return {
    accommodationProcedures: data ?? ([] as AccommodationProcedure[]),
    isLoading,
    isError: Boolean(isError),
    refetch,
  };
}

export function useAccommodationProcedure(id?: number) {
  const { data, isLoading, isError, refetch } = useQuery<AccommodationProcedure, Error, AccommodationProcedure>({
    queryKey: ['accommodation-procedure', id],
    enabled: Boolean(id),
    queryFn: () => internalProceduresService.getAccommodationProcedure(id as number),
  });

  return {
    accommodationProcedure: data ?? (null as unknown as AccommodationProcedure),
    isLoading,
    isError: Boolean(isError),
    refetch,
  };
}

export default useAccommodationProcedures;
