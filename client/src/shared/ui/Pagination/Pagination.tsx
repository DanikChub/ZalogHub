type PaginationProps = {
    page: number;
    totalPages: number;
    onChange: (page: number) => void;
};

function getVisiblePages(page: number, totalPages: number) {
    const pages: Array<number | 'dots'> = [];

    if (totalPages <= 7) {
        return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    pages.push(1);

    if (page > 4) {
        pages.push('dots');
    }

    const start = Math.max(2, page - 1);
    const end = Math.min(totalPages - 1, page + 1);

    for (let i = start; i <= end; i++) {
        pages.push(i);
    }

    if (page < totalPages - 3) {
        pages.push('dots');
    }

    pages.push(totalPages);

    return pages;
}

export function Pagination({ page, totalPages, onChange }: PaginationProps) {
    if (totalPages <= 1) return null;

    const pages = getVisiblePages(page, totalPages);

    return (
        <div className="flex flex-wrap items-center justify-center gap-2">
            <button
                type="button"
                onClick={() => onChange(Math.max(page - 1, 1))}
                disabled={page <= 1}
                className="rounded-xl border border-zinc-700 px-3 py-2 text-sm text-zinc-200 transition hover:border-zinc-600 hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
                Назад
            </button>

            <div className="flex items-center gap-1">
                {pages.map((item, index) => {
                    if (item === 'dots') {
                        return (
                            <span
                                key={`dots-${index}`}
                                className="px-2 text-sm text-zinc-500"
                            >
                                ...
                            </span>
                        );
                    }

                    const isActive = item === page;

                    return (
                        <button
                            key={item}
                            type="button"
                            onClick={() => onChange(item)}
                            className={
                                isActive
                                    ? 'min-w-10 rounded-xl border border-emerald-500/60 bg-emerald-500/10 px-3 py-2 text-sm font-medium text-emerald-300'
                                    : 'min-w-10 rounded-xl border border-zinc-800 px-3 py-2 text-sm text-zinc-300 transition hover:border-zinc-600 hover:bg-zinc-800'
                            }
                        >
                            {item}
                        </button>
                    );
                })}
            </div>

            <button
                type="button"
                onClick={() => onChange(Math.min(page + 1, totalPages))}
                disabled={page >= totalPages}
                className="rounded-xl border border-zinc-700 px-3 py-2 text-sm text-zinc-200 transition hover:border-zinc-600 hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
                Вперед
            </button>
        </div>
    );
}