import React, { useMemo, useState } from 'react';
import newsMock from '../mocks/newsMock';
import NewsCard from '../components/internal/NewsCard';

export const News: React.FC = () => {
    const [query, setQuery] = useState('');
    const [onlyTramites, setOnlyTramites] = useState(true);

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        return newsMock
            .filter((n) => (onlyTramites ? n.tags?.includes('Trámite') ?? false : true))
            .filter((n) => (q ? (n.title + ' ' + n.summary + ' ' + (n.tags ?? []).join(' ')).toLowerCase().includes(q) : true))
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [query, onlyTramites]);

    return (
        <section className="flex flex-col gap-6 justify-start items-center pb-10 grow w-full bg-white border-t-2 border-gray-300 py-8 px-[20%]">
            <article className="w-full">
                <h1 className="text-2xl font-bold mb-2">Noticias sobre trámites - Universidad de Holguín</h1>
                <p className="text-sm text-gray-600 mb-4">Aquí encontrarás las novedades y pasos a seguir para tus trámites universitarios.</p>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
                    <div className="flex items-center gap-2">
                        <input
                            type="text"
                            placeholder="Buscar noticias..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="border border-gray-300 rounded px-3 py-2"
                        />
                        <label className="text-sm flex items-center gap-2">
                            <input type="checkbox" checked={onlyTramites} onChange={(e) => setOnlyTramites(e.target.checked)} />
                            Mostrar solo trámites
                        </label>
                    </div>
                    <div className="text-sm text-gray-500">Resultados: {filtered.length}</div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filtered.map((item) => (
                        <NewsCard key={item.id} item={item} />
                    ))}
                </div>
            </article>
        </section>
    );
};

export default News;