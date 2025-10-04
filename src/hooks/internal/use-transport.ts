import { useQuery } from '@tanstack/react-query';
import type { TransportProcedure } from '../../types/internal/transport';
import { getAllTransportProcedures, getTransportProcedure } from '../../services/internal/internal.procedures.api';

export function useTransportProcedures() {
  const { data, isLoading, isError, refetch } = useQuery<TransportProcedure[], Error, TransportProcedure[]>({
    queryKey: ['transport-procedures'],
    queryFn: () => getAllTransportProcedures().then(r => r.data),
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
    queryFn: () => getTransportProcedure(id as number).then(r => r.data),
  });

  return {
    transportProcedure: data ?? (null as unknown as TransportProcedure),
    isLoading,
    isError: Boolean(isError),
    refetch,
  };
}

export default useTransportProcedures;
