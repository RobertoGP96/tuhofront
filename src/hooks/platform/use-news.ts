import type { PaginatedResponse } from '@/lib/client';
import { newsService } from '@/services/platform/news';
import type {
    CreateNewsData,
    NewsDetail,
    NewsFilterOptions,
    NewsListItem,
    UpdateNewsData
} from '@/types/news';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

/**
 * Hook to get paginated list of news
 */
export function useNews(filters: NewsFilterOptions = {}) {
  return useQuery<PaginatedResponse<NewsListItem>>({
    queryKey: ['news', filters],
    queryFn: () => newsService.getNews(filters),
  });
}

/**
 * Hook to get a single news article by ID or slug
 */
export function useNewsDetail(identifier: string | number) {
  return useQuery<NewsDetail>({
    queryKey: ['news', identifier],
    queryFn: () => newsService.getNewsDetail(identifier),
    enabled: !!identifier,
  });
}

/**
 * Hook to get featured news
 */
export function useFeaturedNews(limit = 3) {
  return useQuery<NewsListItem[]>({
    queryKey: ['news', 'featured', limit],
    queryFn: () => newsService.getFeaturedNews(limit),
  });
}

/**
 * Hook for news mutations
 */
export function useNewsMutations() {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data: CreateNewsData) => newsService.createNews(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number | string; data: UpdateNewsData }) => 
      newsService.updateNews(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['news'] });
      queryClient.invalidateQueries({ queryKey: ['news', id] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number | string) => newsService.deleteNews(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news'] });
    },
  });

  const publishMutation = useMutation({
    mutationFn: (id: number | string) => newsService.publishNews(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['news'] });
      queryClient.invalidateQueries({ queryKey: ['news', id] });
    },
  });

  return {
    createNews: createMutation,
    updateNews: updateMutation,
    deleteNews: deleteMutation,
    publishNews: publishMutation,
  };
}
