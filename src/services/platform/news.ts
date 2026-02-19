import { type PaginatedResponse, apiClient } from '@/lib/client';

export interface NewsBase {
  id: number;
  title: string;
  slug: string;
  summary: string;
  body: string;
  author: number;
  category: string;
  tags: string[];
  featured: boolean;
  is_published: boolean;
  publication_date?: string;
  header_image?: string;
  created_at: string;
  updated_at: string;
}

export interface NewsListItem extends NewsBase {
  author_name?: string;
  category_display?: string;
}

export interface NewsDetail extends NewsBase {
  author_detail?: {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
  };
}

export interface CreateNewsData {
  title: string;
  summary?: string;
  body: string;
  category?: string;
  tags?: string[];
  featured?: boolean;
  header_image?: File;
}

export interface UpdateNewsData extends Partial<CreateNewsData> {}

export interface NewsFilterOptions {
  page?: number;
  page_size?: number;
  category?: string;
  featured?: boolean;
  is_published?: boolean;
  search?: string;
}

const NEWS_ENDPOINTS = {
  NEWS: '/v1/news/',
  FEATURED: '/v1/news/featured/',
  BY_CATEGORY: '/v1/news/by_category/',
  BY_TAG: '/v1/news/by_tag/',
  SEARCH: '/v1/news/search/',
} as const;

class NewsService {
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

  async getNewsDetail(identifier: string | number): Promise<NewsDetail> {
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

  async createNews(data: CreateNewsData): Promise<NewsBase> {
    const formData = new FormData();
    
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (key === 'header_image' && value instanceof File) {
          formData.append('header_image', value);
        } else if (typeof value === 'boolean') {
          formData.append(key, value ? 'true' : 'false');
        } else if (Array.isArray(value)) {
          formData.append(key, JSON.stringify(value));
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

  async updateNews(id: number | string, data: UpdateNewsData): Promise<NewsBase> {
    const formData = new FormData();
    
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (key === 'header_image' && value instanceof File) {
          formData.append('header_image', value);
        } else if (typeof value === 'boolean') {
          formData.append(key, value ? 'true' : 'false');
        } else if (Array.isArray(value)) {
          formData.append(key, JSON.stringify(value));
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

  async deleteNews(id: number | string): Promise<void> {
    await apiClient.delete(`${NEWS_ENDPOINTS.NEWS}${id}/`);
  }

  async getFeaturedNews(limit = 3): Promise<NewsListItem[]> {
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

  async getNewsByCategory(category: string, page = 1, pageSize = 10): Promise<PaginatedResponse<NewsListItem>> {
    const params = new URLSearchParams({
      category,
      page: page.toString(),
      page_size: pageSize.toString(),
    });

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}${NEWS_ENDPOINTS.BY_CATEGORY}?${params}`, {
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'same-origin',
    });
    
    if (!response.ok) {
      throw new Error('Error al cargar las noticias por categoría');
    }
    
    return response.json();
  }

  async publishNews(id: number | string): Promise<NewsBase> {
    const response = await apiClient.post<NewsBase>(
      `${NEWS_ENDPOINTS.NEWS}${id}/publish/`
    );
    return response;
  }

  async unpublishNews(id: number | string): Promise<NewsBase> {
    const response = await apiClient.post<NewsBase>(
      `${NEWS_ENDPOINTS.NEWS}${id}/unpublish/`
    );
    return response;
  }
}

export const newsService = new NewsService();
export default newsService;
