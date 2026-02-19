import type { PaginatedResponse } from '@/lib/client';
import { departmentService } from '@/services/platform/department';
import type {
    CreateDepartmentData,
    DepartmentDetail,
    DepartmentFilterOptions,
    DepartmentListItem,
    DepartmentStats,
    UpdateDepartmentData
} from '@/types/department';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

/**
 * Hook to get paginated list of departments with filters
 */
export function useDepartments(filters: DepartmentFilterOptions = {}) {
  return useQuery<PaginatedResponse<DepartmentListItem>>({
    queryKey: ['departments', filters],
    queryFn: () => departmentService.getDepartments(filters),
  });
}

/**
 * Hook to get a department by ID with full details
 */
export function useDepartmentDetail(id: string) {
  return useQuery<DepartmentDetail>({
    queryKey: ['department', id],
    queryFn: () => departmentService.getDepartmentById(id) as Promise<DepartmentDetail>,
    enabled: !!id,
  });
}

/**
 * Hook to get department statistics
 */
export function useDepartmentStats() {
  return useQuery<DepartmentStats>({
    queryKey: ['departments', 'stats'],
    queryFn: () => departmentService.getDepartmentStats(),
  });
}

/**
 * Hook for department mutations
 */
export function useDepartmentMutations() {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data: CreateDepartmentData) => departmentService.createDepartment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateDepartmentData }) => 
      departmentService.updateDepartment(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      queryClient.invalidateQueries({ queryKey: ['department', id] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => departmentService.deleteDepartment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => 
      departmentService.toggleDepartmentStatus(id, isActive),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      queryClient.invalidateQueries({ queryKey: ['department', id] });
    },
  });

  return {
    createDepartment: createMutation,
    updateDepartment: updateMutation,
    deleteDepartment: deleteMutation,
    toggleDepartmentStatus: toggleStatusMutation,
  };
}
