import { useQuery } from '@tanstack/react-query';
import type { MaintanceProcedure } from '../../types/internal/mantenice';
import { getAllMaintanceProcedures, getMaintanceProcedure } from '../../services/internal/internal.procedures.api';

export function useMaintanceProcedures() {
  const { data, isLoading, isError, refetch } = useQuery<MaintanceProcedure[], Error, MaintanceProcedure[]>({
    queryKey: ['maintance-procedures'],
    queryFn: () => getAllMaintanceProcedures().then(r => r.data),
  });

  return {
    maintanceProcedures: data ?? ([] as MaintanceProcedure[]),
    isLoading,
    isError: Boolean(isError),
    refetch,
  };
}

export function useMaintanceProcedure(id?: number) {
  const { data, isLoading, isError, refetch } = useQuery<MaintanceProcedure, Error, MaintanceProcedure>({
    queryKey: ['maintance-procedure', id],
    enabled: Boolean(id),
    queryFn: () => getMaintanceProcedure(id as number).then(r => r.data),
  });

  return {
    maintanceProcedure: data ?? (null as unknown as MaintanceProcedure),
    isLoading,
    isError: Boolean(isError),
    refetch,
  };
}

export default useMaintanceProcedures;
