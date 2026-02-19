import { useQuery } from '@tanstack/react-query';
import type { TransportProcedure } from '../../types/internal/transport';
import { internalProceduresService } from '../../services/internal';

export function useTransportProcedures() {
  const { data, isLoading, isError, refetch } = useQuery<TransportProcedure[], Error, TransportProcedure[]>({
    queryKey: ['transport-procedures'],
    queryFn: () => internalProceduresService.getAllTransportProcedures().then(r => r.results),
  });

  return {
    transportProcedures: data ?? ([] as TransportProcedure[]),
    isLoading,
    isError: Boolean(isError),
    refetch,
  };
}

export function useTransportProcedure(id?: number) {
  const { data, isLoading, isError, refetch } = useQuery<TransportProcedure, Error, TransportProcedure>({
    queryKey: ['transport-procedure', id],
    enabled: Boolean(id),
    queryFn: () => internalProceduresService.getTransportProcedure(id as number),
  });

  return {
    transportProcedure: data ?? (null as unknown as TransportProcedure),
    isLoading,
    isError: Boolean(isError),
    refetch,
  };
}

export default useTransportProcedures;
