/**
 * News category types
 */
export type NewsCategory = 
  | 'GENERAL'
  | 'ACADEMIC'
  | 'ADMINISTRATIVE'
  | 'MANAGEMENT'
  | 'STUDENT'
  | 'CULTURAL'
  | 'SPORTS'
  | 'RESEARCH'
  | 'EXTENSION';


/**
 * News status types
 */
export type NewsStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

/**
 * Base news interface
 */
export interface NewsBase {
  id: number;
  title: string;
  slug: string;
  category: NewsCategory;
  summary: string | null;
  body: string;
  is_published: boolean;
  publication_date: string | null; // ISO 8601 date string
  featured: boolean;
  tags: string | null;
  status: NewsStatus;
  created_at: string; // ISO 8601 date string
  updated_at: string; // ISO 8601 date string
}

/**
 * News list item (for listing pages)
 */
export interface NewsListItem extends Omit<NewsBase, 'body'> {
  author_name: string | null;
  author_email: string | null;
  tag_list: string[];
  is_new: boolean;
  read_time: number;
  header_image: string | null;
}

/**
 * News detail (for single news view)
 */
export interface NewsDetail extends NewsBase {
  author: {
    id: number;
    name: string | null;
    email: string | null;
  };
  header_image: string | null;
  tag_list: string[];
  read_time: number;
  absolute_url: string;
  related_news: NewsListItem[];
}

/**
 * Data needed to create a new news item
 */
export interface CreateNewsData {
  title: string;
  category?: NewsCategory;
  summary?: string | null;
  body: string;
  is_published?: boolean;
  publication_date?: string | null; // ISO 8601 date string
  featured?: boolean;
  tags?: string | null;
  header_image?: File | null;
  status?: NewsStatus;
}

/**
 * Data needed to update an existing news item
 */
export type UpdateNewsData = Partial<CreateNewsData>;

/**
 * Response type for paginated news lists
 */
export interface PaginatedNewsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: NewsListItem[];
}

/**
 * Filter options for news articles
 */
export interface NewsFilterOptions {
  category?: NewsCategory;
  status?: NewsStatus;
  featured?: boolean;
  search?: string;
  tag?: string;
  author?: number;
  date_from?: string;
  date_to?: string;
  page?: number;
  page_size?: number;
}

