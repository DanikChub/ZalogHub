import type {Deal, DealListItem} from '../model/types';
import { theme } from '@/shared/config/theme.ts';
import {
    AlertTriangle,
    Image,
    Landmark,
    TrendingUp,
    Wallet,

} from 'lucide-react';

import { getDealActionUrl } from '@/shared/lib/deal/getDealActionUrl.ts';


type DealCardProps = {
    deal: DealListItem;
};

function formatMoney(value: number | null) {
    if (value === null || value === undefined) return null;

    return new Intl.NumberFormat('ru-RU').format(value) + ' ₽';
}

function formatMoneyCompact(value: number | null) {
    if (value === null || value === undefined) return null;

    if (value >= 1_000_000_000) {
        return `${new Intl.NumberFormat('ru-RU', {
            maximumFractionDigits: 1,
        })
            .format(value / 1_000_000_000)
            .replace(',0', '')} млрд ₽`;
    }

    if (value >= 1_000_000) {
        return `${new Intl.NumberFormat('ru-RU', {
            maximumFractionDigits: 1,
        })
            .format(value / 1_000_000)
            .replace(',0', '')} млн ₽`;
    }

    if (value >= 100_000) {
        return `${new Intl.NumberFormat('ru-RU', {
            maximumFractionDigits: 0,
        }).format(value / 1_000)} тыс ₽`;
    }

    return new Intl.NumberFormat('ru-RU').format(value) + ' ₽';
}

function formatPercent(value: number | null, fractionDigits = 0) {
    if (value === null || value === undefined) return null;

    return `${new Intl.NumberFormat('ru-RU', {
        minimumFractionDigits: 0,
        maximumFractionDigits: fractionDigits,
    }).format(value)}%`;
}

function formatMonths(value: number | null) {
    if (value === null || value === undefined) return null;

    const mod10 = value % 10;
    const mod100 = value % 100;

    let word = 'месяцев';

    if (mod10 === 1 && mod100 !== 11) {
        word = 'месяц';
    } else if ([2, 3, 4].includes(mod10) && ![12, 13, 14].includes(mod100)) {
        word = 'месяца';
    }

    return `${value} ${word}`;
}

function formatDate(value: string | null) {
    if (!value) return null;

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return null;

    return new Intl.DateTimeFormat('ru-RU', {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(date);
}

function mapBorrowerType(value: Deal['borrowerType']) {
    if (!value) return null;

    switch (value) {
        case 'individual':
            return 'Физ. лицо';
        case 'self_employed':
            return 'Самозанятый';
        case 'sole_proprietor':
            return 'ИП';
        case 'company':
            return 'Юр. лицо';
        default:
            return null;
    }
}

function PrimaryMetric({
                           label,
                           value,
                           icon,
                           valueClassName = 'text-white',
                           hint,
                       }: {
    label: string;
    value: string | null;
    icon: React.ReactNode;
    valueClassName?: string;
    hint?: string | null;
}) {
    if (!value) return null;

    return (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-4">
            <div className="mb-2 flex items-center gap-2 text-zinc-500">
                {icon}
                <span className="text-[11px] font-medium uppercase tracking-wide">
                    {label}
                </span>
            </div>

            <div className={`text-xl font-bold leading-tight ${valueClassName}`}>
                {value}
            </div>

            {hint ? (
                <div className="mt-1 text-[11px] text-zinc-500">{hint}</div>
            ) : null}
        </div>
    );
}

function SecondaryMetric({
                             label,
                             value,
                             valueClassName = 'text-zinc-200',
                         }: {
    label: string;
    value: string | null;
    valueClassName?: string;
}) {
    if (!value) return null;

    return (
        <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 px-3 py-3">
            <div className="text-[11px] font-medium uppercase tracking-wide text-zinc-500">
                {label}
            </div>
            <div
                title={value}
                className={`mt-1 truncate text-sm font-semibold ${valueClassName}`}
            >
                {value}
            </div>
        </div>
    );
}

export function DealCard({deal}: DealCardProps) {


    const contactActionUrl = getDealActionUrl(deal.contactUrl);
    const postActionUrl = getDealActionUrl(deal.postUrl);

    const loanAmount = formatMoneyCompact(deal.loanAmount);
    const collateralValue = formatMoneyCompact(deal.collateralValue);
    const monthlyIncome = formatMoneyCompact(deal.monthlyIncome);

    const interestRateMonthly = formatPercent(deal.interestRateMonthly, 2);
    const ltv = formatPercent(deal.ltv, 2);
    const loanTermMonths = formatMonths(deal.loanTermMonths);
    const publishedAt = formatDate(deal.publishedAt);

    const borrowerType = mapBorrowerType(deal.borrowerType);
    const cityName = deal.city?.name  ?? null;

    const title = deal.objectName || deal.type || 'Заявка без названия';

    const isEstimatedRate = deal.interestRateMonthlySource === 'estimated';

    const isTopDeal = deal.isTopDeal;

    return (
        <article
            className="flex h-full flex-col overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/80 shadow-sm transition hover:border-zinc-700 hover:bg-zinc-900">

            <div className="flex h-full flex-1 flex-col p-4">
                <div className="mb-3 flex items-start justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                        <span
                            className={`inline-flex rounded-full border border-zinc-700 px-2.5 py-1 text-xs font-medium text-white ${theme.accentBorderClass}`}
                        >
                            {deal.source?.name}
                        </span>

                        {isTopDeal && (
                            <span className="inline-flex rounded-full border border-emerald-700/60 bg-emerald-950/40 px-2.5 py-1 text-xs font-semibold text-emerald-300">
                                ТОП
                            </span>
                        )}

                        {deal.type && (
                            <span
                                className="inline-flex rounded-full border border-zinc-700 px-2.5 py-1 text-xs text-zinc-300">
                                {deal.type}
                            </span>
                        )}

                        {/*{cityName && (*/}
                        {/*    <span*/}
                        {/*        className="inline-flex rounded-full border border-zinc-700 px-2.5 py-1 text-xs text-zinc-300">*/}
                        {/*        {cityName}*/}
                        {/*    </span>*/}
                        {/*)}*/}
                    </div>
                    <div className="flex">
                        {deal.images?.length ? (
                            <span className="flex items-center gap-1 text-xs text-zinc-500 mr-4">
                                <Image size={14}/>
                                {deal.images.length}
                            </span>
                        ) : null}
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center">
                            {isEstimatedRate && (
                                <div
                                    title="Ставка предположена системой. Доход рассчитан на ее основе."
                                    className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-amber-800/60 bg-amber-950/40 text-amber-300"
                                >
                                    <AlertTriangle className="h-4 w-4"/>
                                </div>
                            )}
                        </div>
                    </div>

                </div>


                <h3 className="line-clamp-2 text-lg font-semibold text-white">{title}</h3>

                {publishedAt && (
                    <div className="mt-2 text-xs text-zinc-500">
                        Опубликовано: <span className="text-zinc-400">{publishedAt}</span>
                    </div>
                )}

                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <PrimaryMetric
                        label="Сумма займа"
                        value={loanAmount}
                        hint={formatMoney(deal.loanAmount)}
                        icon={<Wallet className="h-4 w-4" />}
                    />

                    <PrimaryMetric
                        label="Доход / мес"
                        value={monthlyIncome ? `${monthlyIncome}/мес` : null}
                        hint={formatMoney(deal.monthlyIncome)}
                        icon={<TrendingUp className="h-4 w-4" />}
                        valueClassName="text-emerald-300"
                    />

                    <PrimaryMetric
                        label="Стоимость залога"
                        value={collateralValue}
                        hint={formatMoney(deal.collateralValue)}
                        icon={<Landmark className="h-4 w-4" />}
                    />
                </div>

                <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <SecondaryMetric
                        label="Срок"
                        value={loanTermMonths}
                    />

                    <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 px-3 py-3">
                        <div
                            className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-wide text-zinc-500">
                            <span>Ставка</span>
                            {isEstimatedRate && (
                                <div
                                    title="Ставка предположена системой. Доход рассчитан на ее основе."
                                    className="inline-flex h-4 w-4 items-center justify-center text-amber-300"
                                >
                                    <AlertTriangle className="h-3.5 w-3.5"/>
                                </div>
                            )}
                        </div>
                        <div
                            className={`mt-1 text-sm font-semibold ${isEstimatedRate ? 'text-amber-300' : 'text-zinc-200'}`}>
                            {interestRateMonthly
                                ? `${isEstimatedRate ? '≈ ' : ''}${interestRateMonthly} / мес.`
                                : null}
                        </div>
                    </div>

                    <SecondaryMetric
                        label="LTV"
                        value={ltv}
                        valueClassName={
                            deal.ltv !== null
                                ? deal.ltv <= 50
                                    ? 'text-emerald-300'
                                    : deal.ltv <= 70
                                        ? 'text-amber-300'
                                        : 'text-red-300'
                                : 'text-zinc-200'
                        }
                    />

                    <SecondaryMetric
                        label="Город"
                        value={cityName}
                    />
                </div>

                {borrowerType && (
                    <div className="mt-3 rounded-xl border border-zinc-800 bg-zinc-950/80 px-3 py-3">
                        <div className="text-[11px] font-medium uppercase tracking-wide text-zinc-500">
                            Тип заемщика
                        </div>
                        <div className="mt-1 text-sm font-semibold text-white">
                            {borrowerType}
                        </div>
                    </div>
                )}




                <div className="mt-auto grid grid-cols-2 gap-3 pt-4">
                    {contactActionUrl ? (
                        <a
                            href={contactActionUrl}
                            target="_blank"
                            rel="noreferrer"
                            className={`justify-center inline-flex items-center rounded-xl px-4 py-2 text-sm font-medium text-black transition hover:opacity-90 ${theme.accentBgClass}`}
                        >
                            Связаться
                        </a>
                    ) : (
                        <button
                            type="button"
                            disabled
                            className="justify-center inline-flex cursor-not-allowed items-center rounded-xl border border-zinc-800 bg-zinc-800 px-4 py-2 text-sm font-medium text-zinc-500"
                        >
                            Связаться
                        </button>
                    )}

                    {postActionUrl ? (
                        <a
                            href={postActionUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="justify-center inline-flex items-center rounded-xl border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-200 transition hover:border-zinc-600 hover:bg-zinc-800"
                        >
                            Перейти к посту
                        </a>
                    ) : (
                        <button
                            type="button"
                            disabled
                            className="justify-center inline-flex cursor-not-allowed items-center rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2 text-sm font-medium text-zinc-500"
                        >
                            Перейти к посту
                        </button>
                    )}
                </div>
            </div>
        </article>
    );
}