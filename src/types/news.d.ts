export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  content?: string;
  date: string; // ISO date
  tags?: string[];
  link?: string;
}

export type NewsList = NewsItem[];
