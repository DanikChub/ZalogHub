import { useMemo, useState } from 'react';
import type { DealActionModalPayload } from '../model/deal-action';

type DealActionModalProps = {
    payload: DealActionModalPayload;
    onClose: () => void;
};

function formatMoney(value?: number | null) {
    if (value === null || value === undefined) return null;

    return new Intl.NumberFormat('ru-RU').format(value) + ' ₽';
}

export function DealActionModal({ payload, onClose }: DealActionModalProps) {
    const [copied, setCopied] = useState(false);

    const description =
        payload.type === 'contact'
            ? 'Вы будете перенаправлены в Telegram. Напишите брокеру напрямую, чтобы обсудить условия сделки.'
            : 'Вы будете перенаправлены в Telegram-бота или форму. Оставьте заявку, и брокеры свяжутся с вами.';

    const note = useMemo(() => {
        const parts = [
            payload.objectName || null,
            payload.address || null,
            formatMoney(payload.loanAmount),
        ].filter(Boolean);

        return parts.join('\n');
    }, [payload.objectName, payload.address, payload.loanAmount]);

    const handleCopy = async () => {
        if (!note) return;

        try {
            await navigator.clipboard.writeText(note);
            setCopied(true);

            window.setTimeout(() => {
                setCopied(false);
            }, 2000);
        } catch {
            setCopied(false);
        }
    };

    const handleContinue = () => {
        if (payload.url) {
            window.open(payload.url, '_blank', 'noopener,noreferrer');
        }

        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl">
                <h3 className="text-lg font-semibold text-white">
                    {payload.title}
                </h3>

                <p className="mt-3 text-sm leading-6 text-zinc-400">
                    {description}
                </p>

                {note && (
                    <div className="mt-4 rounded-xl border border-zinc-800 bg-zinc-950/80 p-3">
                        <div className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                            Информация по заявке
                        </div>

                        <div className="mt-2 whitespace-pre-wrap text-sm text-zinc-300">
                            {note}
                        </div>

                        <button
                            type="button"
                            onClick={handleCopy}
                            className="mt-3 inline-flex rounded-lg border border-zinc-700 px-3 py-2 text-xs font-medium text-zinc-200 transition hover:bg-zinc-800"
                        >
                            {copied ? 'Скопировано' : 'Скопировать'}
                        </button>
                    </div>
                )}

                {!payload.url && (
                    <div className="mt-4 rounded-xl border border-red-900/50 bg-red-950/30 p-3 text-sm text-red-200">
                        Ссылка для перехода недоступна.
                    </div>
                )}

                <div className="mt-6 flex gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 rounded-xl border border-zinc-700 px-4 py-2.5 text-sm font-medium text-zinc-300 transition hover:bg-zinc-800"
                    >
                        Отмена
                    </button>

                    <button
                        type="button"
                        onClick={handleContinue}
                        disabled={!payload.url}
                        className="flex-1 rounded-xl bg-white px-4 py-2.5 text-sm font-medium text-black transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Перейти
                    </button>
                </div>
            </div>
        </div>
    );
}