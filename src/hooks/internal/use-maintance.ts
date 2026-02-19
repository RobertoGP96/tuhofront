import { useQuery } from '@tanstack/react-query';
import type { MaintanceProcedure } from '../../types/internal/mantenice';
import { internalProceduresService } from '../../services/internal';

export function useMaintanceProcedures() {
  const { data, isLoading, isError, refetch } = useQuery<MaintanceProcedure[], Error, MaintanceProcedure[]>({
    queryKey: ['maintance-procedures'],
    queryFn: () => internalProceduresService.getAllMaintanceProcedures().then(r => r.results),
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
    queryFn: () => internalProceduresService.getMaintanceProcedure(id as number),
  });

  return {
    maintanceProcedure: data ?? (null as unknown as MaintanceProcedure),
    isLoading,
    isError: Boolean(isError),
    refetch,
  };
}

export default useMaintanceProcedures;
