import type { PaginatedResponse } from '@/lib/client';
import { userService } from '@/services/platform/user';
import type {
    CreateUserData,
    UpdateUserData,
    UserProfile
} from '@/types/user';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

/**
 * Filter options for users
 */
export interface UserFilterOptions {
  search?: string;
  user_type?: string;
  is_active?: boolean;
  page?: number;
  page_size?: number;
}

/**
 * Hook to get paginated list of users with filters
 */
export function useUsers(filters: UserFilterOptions = {}) {
  const { page = 1, page_size = 10, ...rest } = filters;
  return useQuery<PaginatedResponse<UserProfile>>({
    queryKey: ['users', filters],
    queryFn: () => userService.getUsers(page, page_size, rest),
  });
}

/**
 * Hook to get user by ID
 */
export function useUserDetail(id: string | number) {
  return useQuery<UserProfile>({
    queryKey: ['user', id],
    queryFn: () => userService.getUserById(id),
    enabled: !!id,
  });
}

/**
 * Hook for user mutations
 */
export function useUserMutations() {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data: CreateUserData) => userService.createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string | number; data: UpdateUserData }) => 
      userService.updateUser(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user', id] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string | number) => userService.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string | number; isActive: boolean }) => 
      userService.toggleUserStatus(id, isActive),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user', id] });
    },
  });

  return {
    createUser: createMutation,
    updateUser: updateMutation,
    deleteUser: deleteMutation,
    toggleUserStatus: toggleStatusMutation,
  };
}
