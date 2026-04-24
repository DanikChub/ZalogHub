import { useEffect, useState } from 'react';
import { getSources } from '../api/getSources';
import type { Source } from '../model/types';

type SourceSelectProps = {
    value?: number;
    onChange: (sourceId?: number) => void;
};

export function SourceSelect({ value, onChange }: SourceSelectProps) {
    const [sources, setSources] = useState<Source[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        let cancelled = false;

        async function loadSources() {
            try {
                setLoading(true);
                const result = await getSources();
                console.log(result)
                if (!cancelled) {
                    setSources(result);
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        loadSources();

        return () => {
            cancelled = true;
        };
    }, []);

    return (
        <select
            value={value ?? ''}
            onChange={(e) => {
                const nextValue = e.target.value;
                onChange(nextValue ? Number(nextValue) : undefined);
            }}
            disabled={loading}
            className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-white outline-none transition focus:border-zinc-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
            <option value="">Все источники</option>

            {sources.map((source) => (
                <option key={source.id} value={source.id}>
                    {source.name}
                </option>
            ))}
        </select>
    );
}