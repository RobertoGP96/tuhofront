import { useQuery } from '@tanstack/react-query';
import type { Area } from '../../types/internal/general';
import { getAllAreas } from '../../services/internal/internal.procedures.api';

/**
 * Hook para obtener las áreas desde la API.
 */
export function useArea() {
  const {
    data: areasData,
    isLoading: isLoadingAreas,
    isError: isErrorAreas,
    refetch: refetchAreas,
  } = useQuery<Area[], Error, Area[]>({ queryKey: ['areas'], queryFn: () => getAllAreas().then(r => r.data) });

  return {
    areas: areasData ?? ([] as Area[]),
    isLoading: isLoadingAreas,
    isError: Boolean(isErrorAreas),
    refetch: refetchAreas,
  };
}

export default useArea;
