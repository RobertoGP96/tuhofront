import { type PaginatedResponse, apiClient } from '@/lib/client';

export interface News {
  id: number;
  titulo: string;
  contenido: string;
  autor?: number;
  created_at: string;
  updated_at: string;
  imagen?: string;
  activa?: boolean;
}

export interface CreateNewsData {
  titulo: string;
  contenido: string;
  imagen?: File | string;
  activa?: boolean;
}

export interface UpdateNewsData extends Partial<CreateNewsData> {}

// Endpoints de noticias
const NEWS_ENDPOINTS = {
  NEWS: '/v1/noticias/',
} as const;

class NewsService {
  /**
   * Obtener lista de noticias con paginación
   */
  async getNews(
    page = 1,
    pageSize = 10
  ): Promise<PaginatedResponse<News>> {
    const params = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString(),
    });

    const response = await apiClient.get<PaginatedResponse<News>>(
      `${NEWS_ENDPOINTS.NEWS}?${params}`
    );

    return response;
  }

  /**
   * Obtener una noticia por ID
   */
  async getNewsById(id: number): Promise<News> {
    const response = await apiClient.get<News>(
      `${NEWS_ENDPOINTS.NEWS}${id}/`
    );

    return response;
  }

  /**
   * Crear una nueva noticia
   */
  async createNews(data: CreateNewsData): Promise<News> {
    const response = await apiClient.post<News>(
      NEWS_ENDPOINTS.NEWS,
      data
    );

    return response;
  }

  /**
   * Actualizar una noticia
   */
  async updateNews(id: number, data: UpdateNewsData): Promise<News> {
    const response = await apiClient.patch<News>(
      `${NEWS_ENDPOINTS.NEWS}${id}/`,
      data
    );

    return response;
  }

  /**
   * Eliminar una noticia
   */
  async deleteNews(id: number): Promise<void> {
    await apiClient.delete(`${NEWS_ENDPOINTS.NEWS}${id}/`);
  }
}

// Instancia singleton del servicio de noticias
export const newsService = new NewsService();

// Export default para compatibilidad
export default newsService;

