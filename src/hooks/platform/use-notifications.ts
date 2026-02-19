import type { PaginatedResponse } from '@/lib/client';
import { notificationService } from '@/services/platform/notification';
import type {
    CreateNotificationData,
    Notification,
    NotificationFilters
} from '@/types/notification';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

/**
 * Hook to get notifications with filters and pagination
 */
export function useNotifications(filters: NotificationFilters = {}) {
  return useQuery<PaginatedResponse<Notification>>({
    queryKey: ['notifications', filters],
    queryFn: () => notificationService.getNotifications(filters),
  });
}

/**
 * Hook to get current user notifications
 */
export function useMyNotifications(filters: NotificationFilters = {}) {
  return useQuery<PaginatedResponse<Notification>>({
    queryKey: ['my-notifications', filters],
    queryFn: () => notificationService.getMyNotifications(filters),
  });
}


/**
 * Hook to get a single notification by ID
 */
export function useNotification(id: number) {
  return useQuery<Notification>({
    queryKey: ['notification', id],
    queryFn: () => notificationService.getNotificationById(id),
    enabled: !!id,
  });
}

/**
 * Hook for notification mutations (create, mark as read, delete)
 */
export function useNotificationMutations() {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data: CreateNotificationData) => 
      notificationService.createNotification(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['my-notifications'] });
    },
  });

  const markAsReadMutation = useMutation({
    mutationFn: (id: number) => 
      notificationService.markAsRead(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['my-notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notification', id] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => 
      notificationService.deleteNotification(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['my-notifications'] });
    },
  });

  return {
    createNotification: createMutation,
    markAsRead: markAsReadMutation,
    deleteNotification: deleteMutation,
  };
}
