import React from 'react';
import type { NewsItem } from '../../types/news.d';

interface Props {
  item: NewsItem;
}

export const NewsCard: React.FC<Props> = ({ item }) => {
  const date = new Date(item.date).toLocaleDateString();
  return (
    <article className="bg-gray-50 border border-gray-200 rounded-md p-4 shadow-sm w-full">
      <header className="flex items-start justify-between gap-4">
        <h3 className="text-lg font-semibold">{item.title}</h3>
        <time className="text-sm text-gray-500">{date}</time>
      </header>
      <p className="mt-2 text-sm text-gray-700">{item.summary}</p>
      <div className="mt-3 flex items-center justify-between">
        <div className="flex gap-2">
          {item.tags?.map((t) => (
            <span key={t} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
              {t}
            </span>
          ))}
        </div>
        <a href={item.link ?? '#'} className="text-sm text-blue-600 hover:underline">
          Leer más
        </a>
      </div>
    </article>
  );
};

export default NewsCard;
