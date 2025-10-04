import { useQuery } from '@tanstack/react-query';
import type { AccommodationProcedure } from '../../types/internal/accomodation';
import { getAllAccommodationProcedures, getAccommodationProcedure } from '../../services/internal/internal.procedures.api';

export function useAccommodationProcedures() {
  const { data, isLoading, isError, refetch } = useQuery<AccommodationProcedure[], Error, AccommodationProcedure[]>({
    queryKey: ['accommodation-procedures'],
    queryFn: () => getAllAccommodationProcedures().then(r => r.data),
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
    queryFn: () => getAccommodationProcedure(id as number).then(r => r.data),
  });

  return {
    accommodationProcedure: data ?? (null as unknown as AccommodationProcedure),
    isLoading,
    isError: Boolean(isError),
    refetch,
  };
}

export default useAccommodationProcedures;
