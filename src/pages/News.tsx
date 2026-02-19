import { newsService } from '@/services/platform/news';
import type { NewsDetail, NewsListItem } from '@/types/news';
import { Newspaper } from 'lucide-react';
import React, { useState } from 'react';
import { NewsDetailView, NewsList } from '../components/platform/news';

export const News: React.FC = () => {
    const [selectedNews, setSelectedNews] = useState<NewsDetail | null>(null);
    const [viewMode, setViewMode] = useState<'list' | 'detail'>('list');

    const handleViewNews = async (news: NewsListItem) => {
        try {
            const detail = await newsService.getNewsDetail(news.id);
            setSelectedNews(detail);
            setViewMode('detail');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (error) {
            console.error('Error fetching news detail:', error);
        }
    };

    const handleBackToList = () => {
        setViewMode('list');
        setSelectedNews(null);
    };

    return (
        <main className="min-h-screen bg-gray-50/30">
            {/* Header Section */}
            <div className="bg-white border-b border-gray-200 pt-12 pb-8 px-6 md:px-[15%]">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                            <Newspaper className="w-6 h-6" />
                        </div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">
                            Portal Informativo UHO
                        </h1>
                    </div>
                    <p className="text-gray-500 max-w-2xl leading-relaxed font-medium">
                        Mantente actualizado con las últimas noticias, eventos y trámites de la Universidad de Holguín.
                        Toda la información oficial en un solo lugar.
                    </p>
                </div>
            </div>

            {/* Content Section */}
            <section className="py-12 px-6 md:px-[15%]">
                <div className="max-w-7xl mx-auto">
                    {viewMode === 'list' ? (
                        <div className="animate-in fade-in duration-700">
                             <NewsList 
                                onView={handleViewNews}
                             />
                        </div>
                    ) : (
                        selectedNews && (
                            <NewsDetailView 
                                news={selectedNews} 
                                onBack={handleBackToList}
                            />
                        )
                    )}
                </div>
            </section>
        </main>
    );
};

export default News;
