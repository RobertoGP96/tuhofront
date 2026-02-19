import type { PaginatedResponse } from '@/lib/client';
import { platformProcedureService, type CreateProcedureData, type ProcedureDetail, type ProcedureFilterOptions, type ProcedureListItem, type ProcedureStats, type ProcedureType, type UpdateProcedureData } from '@/services/platform/procedure';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

/**
 * Hook to get paginated list of procedures with filters
 */
export function useProcedures(filters?: ProcedureFilterOptions) {
  return useQuery<PaginatedResponse<ProcedureListItem>>({
    queryKey: ['procedures', filters],
    queryFn: () => platformProcedureService.getProcedures(filters),
  });
}

/**
 * Hook to get current user's procedures
 */
export function useMyProcedures(filters?: ProcedureFilterOptions) {
  return useQuery<PaginatedResponse<ProcedureListItem>>({
    queryKey: ['my-procedures', filters],
    queryFn: () => platformProcedureService.getMyProcedures(filters),
  });
}

/**
 * Hook to get a procedure by ID with full details
 */
export function useProcedureDetail(id: string) {
  return useQuery<ProcedureDetail>({
    queryKey: ['procedure', id],
    queryFn: () => platformProcedureService.getProcedureById(id),
    enabled: !!id,
  });
}

/**
 * Hook to get procedure types
 */
export function useProcedureTypes() {
  return useQuery<ProcedureType[]>({
    queryKey: ['procedure-types'],
    queryFn: () => platformProcedureService.getProcedureTypes(),
  });
}

/**
 * Hook to get procedure statistics
 */
export function useProcedureStats() {
  return useQuery<ProcedureStats>({
    queryKey: ['procedures', 'stats'],
    queryFn: () => platformProcedureService.getProcedureStats(),
  });
}

/**
 * Hook for procedure mutations
 */
export function useProcedureMutations() {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data: CreateProcedureData) => platformProcedureService.createProcedure(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['procedures'] });
      queryClient.invalidateQueries({ queryKey: ['my-procedures'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProcedureData }) => 
      platformProcedureService.updateProcedure(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['procedures'] });
      queryClient.invalidateQueries({ queryKey: ['my-procedures'] });
      queryClient.invalidateQueries({ queryKey: ['procedure', id] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => platformProcedureService.deleteProcedure(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['procedures'] });
      queryClient.invalidateQueries({ queryKey: ['my-procedures'] });
    },
  });

  const transitionMutation = useMutation({
    mutationFn: ({ id, state, observation }: { id: string; state: string; observation?: string }) => 
      platformProcedureService.transitionState(id, state, observation),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['procedures'] });
      queryClient.invalidateQueries({ queryKey: ['my-procedures'] });
      queryClient.invalidateQueries({ queryKey: ['procedure', id] });
    },
  });

  return {
    createProcedure: createMutation,
    updateProcedure: updateMutation,
    deleteProcedure: deleteMutation,
    transitionState: transitionMutation,
  };
}
