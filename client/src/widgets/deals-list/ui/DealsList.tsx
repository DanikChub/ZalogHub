import { useEffect, useState } from 'react';

import {
    DealFilters,
    type DealFiltersValues,
} from '@/features/deal-filters';
import {DealCard, type DealListItem, getDeals} from "@/entities/deal";
import {Pagination} from "@/shared/ui/Pagination";

const DEFAULT_PAGE_SIZE = 20;

const initialFilters: DealFiltersValues = {
    sortBy: 'publishedAt',
    sortOrder: 'DESC',
};

export function DealsList() {
    const [items, setItems] = useState<DealListItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [filters, setFilters] = useState<DealFiltersValues>(initialFilters);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        let isMounted = true;

        async function loadDeals() {
            try {
                setIsLoading(true);
                setError(null);

                const response = await getDeals({
                    ...filters,
                    page,
                    limit: DEFAULT_PAGE_SIZE,
                });

                if (!isMounted) return;

                setItems(response.items);
                setTotalPages(response.pagination.totalPages);
            } catch (err) {
                if (!isMounted) return;

                setError('Не удалось загрузить заявки');
                console.error(err);
            } finally {
                if (!isMounted) return;
                setIsLoading(false);
            }
        }

        loadDeals();

        return () => {
            isMounted = false;
        };
    }, [filters, page]);

    const handleFiltersChange = (next: DealFiltersValues) => {
        setPage(1);
        setFilters(next);
    };

    const handleResetFilters = () => {
        setPage(1);
        setFilters(initialFilters);
    };

    return (
        <div className="space-y-6">
            <DealFilters
                value={filters}
                onChange={handleFiltersChange}
                onReset={handleResetFilters}
            />

            {isLoading && (
                <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                    {Array.from({ length: 6 }).map((_, index) => (
                        <div
                            key={index}
                            className="h-48 animate-pulse rounded-2xl border border-zinc-800 bg-zinc-900"
                        />
                    ))}
                </div>
            )}

            {!isLoading && error && (
                <div className="rounded-2xl border border-red-900/50 bg-red-950/30 p-6 text-red-200">
                    {error}
                </div>
            )}

            {!isLoading && !error && !items.length && (
                <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-8 text-center text-zinc-400">
                    По выбранным фильтрам заявки не найдены
                </div>
            )}

            {!isLoading && !error && !!items.length && (
                <>
                    <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                        {items.map((deal) => (
                            <DealCard key={deal.id} deal={deal} />
                        ))}
                    </div>

                    <Pagination
                        page={page}
                        totalPages={totalPages}
                        onChange={setPage}
                    />
                </>
            )}
        </div>
    );
}