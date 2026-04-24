import { useEffect, useRef, useState } from 'react';
import { searchCities } from '../api/searchCities.ts';
import type { City } from '../model/types.ts';

type CitiesMultiSelectProps = {
    value: City[];
    onChange: (next: City[]) => void;
    placeholder?: string;
    disabled?: boolean;
    className?: string;
};

export function CitiesMultiSelect({
                                      value,
                                      onChange,
                                      placeholder = 'Начните вводить город...',
                                      disabled = false,
                                      className = '',
                                  }: CitiesMultiSelectProps) {
    const [query, setQuery] = useState('');
    const [options, setOptions] = useState<City[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const rootRef = useRef<HTMLDivElement | null>(null);
    const debounceRef = useRef<number | null>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (!rootRef.current) return;
            if (rootRef.current.contains(event.target as Node)) return;
            setIsOpen(false);
        };

        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    useEffect(() => {
        if (debounceRef.current) {
            window.clearTimeout(debounceRef.current);
        }

        const trimmedQuery = query.trim();

        if (trimmedQuery.length < 2) {
            setOptions([]);
            setIsOpen(false);
            return;
        }

        debounceRef.current = window.setTimeout(async () => {
            try {
                setIsLoading(true);

                const cities = await searchCities({
                    q: trimmedQuery,
                    limit: 12,
                });

                const selectedIds = new Set(value.map((city) => city.id));
                const filtered = cities.filter((city) => !selectedIds.has(city.id));

                setOptions(filtered);
                setIsOpen(true);
            } catch (error) {
                console.error('Ошибка поиска городов', error);
                setOptions([]);
                setIsOpen(false);
            } finally {
                setIsLoading(false);
            }
        }, 250);

        return () => {
            if (debounceRef.current) {
                window.clearTimeout(debounceRef.current);
            }
        };
    }, [query, value]);

    const handleSelect = (city: City) => {
        onChange([...value, city]);
        setQuery('');
        setOptions([]);
        setIsOpen(false);
    };

    const handleRemove = (cityId: number) => {
        onChange(value.filter((city) => city.id !== cityId));
    };

    return (
        <div ref={rootRef} className={`relative ${className}`}>
            <div className="rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 transition focus-within:border-zinc-600">
                {value.length > 0 && (
                    <div className="mb-2 flex flex-wrap gap-2">
                        {value.map((city) => (
                            <div
                                key={city.id}
                                className="inline-flex max-w-full items-center gap-2 rounded-full border border-zinc-700 bg-zinc-900 px-3 py-1 text-sm text-white"
                            >
                                <span className="truncate">{city.name}</span>

                                <button
                                    type="button"
                                    onClick={() => handleRemove(city.id)}
                                    className="text-zinc-400 transition hover:text-white"
                                >
                                    ✕
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => {
                        if (options.length > 0) {
                            setIsOpen(true);
                        }
                    }}
                    placeholder={placeholder}
                    disabled={disabled}
                    className="w-full bg-transparent text-sm text-white outline-none placeholder:text-zinc-500"
                />
            </div>

            {isOpen && (
                <div className="absolute z-30 mt-2 max-h-72 w-full overflow-y-auto rounded-xl border border-zinc-800 bg-zinc-950 shadow-2xl">
                    {isLoading ? (
                        <div className="px-3 py-3 text-sm text-zinc-400">
                            Поиск...
                        </div>
                    ) : options.length === 0 ? (
                        <div className="px-3 py-3 text-sm text-zinc-500">
                            Ничего не найдено
                        </div>
                    ) : (
                        options.map((city) => (
                            <button
                                key={city.id}
                                type="button"
                                onClick={() => handleSelect(city)}
                                className="flex w-full flex-col items-start border-b border-zinc-800 px-3 py-3 text-left transition last:border-b-0 hover:bg-zinc-900"
                            >
                                <span className="text-sm font-medium text-white">
                                    {city.name}
                                </span>

                                <span className="text-xs text-zinc-400">
                                    {city.regionName + ' область' || 'Без региона'}
                                </span>
                            </button>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}