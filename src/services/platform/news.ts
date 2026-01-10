import { type PaginatedResponse, apiClient } from '@/lib/client';
import type {
    CreateNewsData,
    NewsBase,
    NewsDetail,
    NewsListItem,
    UpdateNewsData
} from '@/types/news';

// News API endpoints
const NEWS_ENDPOINTS = {
  NEWS: '/v1/news/',
  FEATURED: '/v1/news/featured/',
  CATEGORIES: '/v1/news/categories/',
} as const;

class NewsService {
  /**
   * Get paginated list of news
   */
  async getNews(
    page = 1,
    pageSize = 10,
    filters: Record<string, any> = {}
  ): Promise<PaginatedResponse<NewsListItem>> {
    const params = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString(),
      ...filters
    });

    const response = await apiClient.get<PaginatedResponse<NewsListItem>>(
      `${NEWS_ENDPOINTS.NEWS}?${params}`
    );
    return response;
  }

  /**
   * Get a single news item by slug or ID
   */
  async getNewsDetail(identifier: string | number): Promise<NewsDetail> {
    const response = await apiClient.get<NewsDetail>(`${NEWS_ENDPOINTS.NEWS}${identifier}/`);
    return response;
  }

  /**
   * Create a new news article
   */
  async createNews(data: CreateNewsData): Promise<NewsBase> {
    const formData = new FormData();
    
    // Append all fields to form data
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (key === 'header_image' && value instanceof File) {
          formData.append('header_image', value);
        } else if (typeof value === 'boolean') {
          formData.append(key, value ? 'true' : 'false');
        } else {
          formData.append(key, value as string);
        }
      }
    });

    const response = await apiClient.post<NewsBase>(NEWS_ENDPOINTS.NEWS, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response;
  }

  /**
   * Update an existing news article
   */
  async updateNews(id: number | string, data: UpdateNewsData): Promise<NewsBase> {
    const formData = new FormData();
    
    // Append all fields to form data
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (key === 'header_image' && value instanceof File) {
          formData.append('header_image', value);
        } else if (typeof value === 'boolean') {
          formData.append(key, value ? 'true' : 'false');
        } else {
          formData.append(key, value as string);
        }
      }
    });

    const response = await apiClient.patch<NewsBase>(
      `${NEWS_ENDPOINTS.NEWS}${id}/`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response;
  }

  /**
   * Delete a news article
   */
  async deleteNews(id: number | string): Promise<void> {
    await apiClient.delete(`${NEWS_ENDPOINTS.NEWS}${id}/`);
  }

  /**
   * Get featured news
   */
  async getFeaturedNews(limit = 3): Promise<NewsListItem[]> {
    const response = await apiClient.get<NewsListItem[]>(
      `${NEWS_ENDPOINTS.FEATURED}?limit=${limit}`
    );
    return response;
  }

  /**
   * Publish a news article
   */
  async publishNews(id: number | string): Promise<NewsBase> {
    const response = await apiClient.post<NewsBase>(
      `${NEWS_ENDPOINTS.NEWS}${id}/publish/`
    );
    return response;
  }
}

// Singleton instance of the news service
export const newsService = new NewsService();

// Default export for compatibility
export default newsService;