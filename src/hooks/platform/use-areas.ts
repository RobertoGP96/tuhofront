import type { PaginatedResponse } from '@/lib/client';
import { areaService } from '@/services/platform/area';
import type {
    AreaDetail,
    AreaFilterOptions,
    AreaListItem,
    AreaStats,
    CreateAreaData,
    UpdateAreaData
} from '@/types/area';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

/**
 * Hook to get paginated list of areas with filters
 */
export function useAreas(filters?: AreaFilterOptions) {
  return useQuery<PaginatedResponse<AreaListItem>>({
    queryKey: ['areas', filters],
    queryFn: () => areaService.getAreas(filters),
  });
}

/**
 * Hook to get an area by ID with full details
 */
export function useAreaDetail(id: string) {
  return useQuery<AreaDetail>({
    queryKey: ['area', id],
    queryFn: () => areaService.getAreaById(id),
    enabled: !!id,
  });
}

/**
 * Hook to get area statistics
 */
export function useAreaStats() {
  return useQuery<AreaStats>({
    queryKey: ['areas', 'stats'],
    queryFn: () => areaService.getAreaStats(),
  });
}

/**
 * Hook for area mutations
 */
export function useAreaMutations() {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data: CreateAreaData) => areaService.createArea(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['areas'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAreaData }) => 
      areaService.updateArea(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['areas'] });
      queryClient.invalidateQueries({ queryKey: ['area', id] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => areaService.deleteArea(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['areas'] });
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => 
      areaService.toggleAreaStatus(id, isActive),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['areas'] });
      queryClient.invalidateQueries({ queryKey: ['area', id] });
    },
  });

  return {
    createArea: createMutation,
    updateArea: updateMutation,
    deleteArea: deleteMutation,
    toggleAreaStatus: toggleStatusMutation,
  };
}
