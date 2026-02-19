import { type PaginatedResponse, apiClient } from '@/lib/client';
import type {
  CreateNewsData,
  NewsBase,
  NewsDetail,
  NewsFilterOptions,
  NewsListItem,
  UpdateNewsData
} from '@/types/news';

// News API endpoints
const NEWS_ENDPOINTS = {
  NEWS: '/v1/news/',
  FEATURED: '/v1/news/featured/',
  CATEGORIES: '/v1/news/categories/',
} as const;

/**
 * Servicio de noticias
 */
class NewsService {
  /**
   * Get paginated list of news
   */
  async getNews(
    filters: NewsFilterOptions = {}
  ): Promise<PaginatedResponse<NewsListItem>> {
    const { page = 1, page_size = 10, ...rest } = filters;
    const params = new URLSearchParams({
      page: page.toString(),
      page_size: page_size.toString(),
    });

    Object.entries(rest).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });

    // Usar fetch directamente para evitar el envío del token de autenticación
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}${NEWS_ENDPOINTS.NEWS}?${params}`, {
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'same-origin',
    });
    
    if (!response.ok) {
      throw new Error('Error al cargar las noticias');
    }
    
    return response.json();
  }

  /**
   * Get a single news item by slug or ID
   */
  async getNewsDetail(identifier: string | number): Promise<NewsDetail> {
    // Usar fetch directamente para evitar el envío del token de autenticación
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}${NEWS_ENDPOINTS.NEWS}${identifier}/`, {
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'same-origin',
    });
    
    if (!response.ok) {
      throw new Error('Error al cargar el detalle de la noticia');
    }
    
    return response.json();
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
    // Usar fetch directamente para evitar el envío del token de autenticación
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}${NEWS_ENDPOINTS.FEATURED}?limit=${limit}`, {
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'same-origin',
    });
    
    if (!response.ok) {
      throw new Error('Error al cargar las noticias destacadas');
    }
    
    return response.json();
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