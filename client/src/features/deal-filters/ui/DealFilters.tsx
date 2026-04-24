import type { ChangeEvent } from 'react';
import { CitiesMultiSelect, type City } from '@/entities/city';
import type { DealFilters as DealFiltersType } from '../models/types.ts';
import {SourceSelect} from "@/entities/source";

type DealFiltersProps = {
    value: DealFiltersType;
    onChange: (next: DealFiltersType) => void;
    onReset: () => void;
};

function toNumberOrUndefined(value: string): number | undefined {
    if (!value.trim()) return undefined;

    const num = Number(value);
    return Number.isFinite(num) ? num : undefined;
}

export function DealFilters({ value, onChange, onReset }: DealFiltersProps) {
    const handleNumberChange =
        (field: keyof DealFiltersType) => (e: ChangeEvent<HTMLInputElement>) => {
            onChange({
                ...value,
                [field]: toNumberOrUndefined(e.target.value),
            });
        };

    const handleSelectChange =
        (field: keyof DealFiltersType) => (e: ChangeEvent<HTMLSelectElement>) => {
            const nextValue = e.target.value || undefined;

            onChange({
                ...value,
                [field]: nextValue,
            });
        };

    const handleCitiesChange = (cities: City[]) => {
        onChange({
            ...value,
            cities,
            cityIds: cities.length ? cities.map((city) => city.id) : undefined,
        });
    };

    const handleTextChange =
        (field: keyof DealFiltersType) => (e: ChangeEvent<HTMLInputElement>) => {
            const nextValue = e.target.value;

            onChange({
                ...value,
                [field]: nextValue.trim() ? nextValue : undefined,
            });
        };

    return (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-4">
            <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                    <h2 className="text-lg font-semibold text-white">Фильтры</h2>
                    <p className="mt-1 text-sm text-zinc-400">
                        Отберите сделки по ключевым параметрам
                    </p>
                </div>

                <button
                    type="button"
                    onClick={onReset}
                    className="rounded-xl border border-zinc-700 px-3 py-2 text-sm text-zinc-300 transition hover:border-zinc-600 hover:bg-zinc-800"
                >
                    Сбросить
                </button>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
                <div className="md:col-span-2 xl:col-span-4">
                    <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-zinc-500">
                        Поиск
                    </label>

                    <input
                        type="text"
                        value={value.search ?? ''}
                        onChange={handleTextChange('search')}
                        placeholder="Адрес, ЖК, тип объекта, текст заявки..."
                        className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-zinc-600"
                    />
                </div>
                <div className="md:col-span-2 xl:col-span-4">
                    <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-zinc-500">
                        Города
                    </label>

                    <CitiesMultiSelect
                        value={value.cities ?? []}
                        onChange={handleCitiesChange}
                        placeholder="Введите город и выберите один или несколько"
                    />
                </div>

                <div>
                    <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-zinc-500">
                        Тип заемщика
                    </label>
                    <select
                        value={value.borrowerType ?? ''}
                        onChange={handleSelectChange('borrowerType')}
                        className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-white outline-none transition focus:border-zinc-600"
                    >
                        <option value="">Все</option>
                        <option value="individual">Физ. лицо</option>
                        <option value="self_employed">Самозанятый</option>
                        <option value="sole_proprietor">ИП</option>
                        <option value="company">Юр. лицо</option>
                    </select>
                </div>

                <div>
                    <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-zinc-500">
                        Сортировать по
                    </label>
                    <select
                        value={value.sortBy ?? 'publishedAt'}
                        onChange={handleSelectChange('sortBy')}
                        className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-white outline-none transition focus:border-zinc-600"
                    >
                        <option value="topDealScore">Лучшие</option>
                        <option value="publishedAt">Дате</option>
                        <option value="monthlyIncome">Доходу / мес</option>
                        <option value="loanAmount">Сумме займа</option>
                        <option value="collateralValue">Стоимости залога</option>
                        <option value="interestRateMonthly">Ставке</option>
                        <option value="ltv">LTV</option>
                    </select>
                </div>

                <div>
                    <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-zinc-500">
                        Порядок
                    </label>
                    <select
                        value={value.sortOrder ?? 'DESC'}
                        onChange={handleSelectChange('sortOrder')}
                        className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-white outline-none transition focus:border-zinc-600"
                    >
                        <option value="DESC">По убыванию</option>
                        <option value="ASC">По возрастанию</option>
                    </select>
                </div>

                <div>
                    <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-zinc-500">
                        Сумма займа от
                    </label>
                    <input
                        type="number"
                        value={value.minLoanAmount ?? ''}
                        onChange={handleNumberChange('minLoanAmount')}
                        className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-white outline-none transition focus:border-zinc-600"
                    />
                </div>

                <div>
                    <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-zinc-500">
                        Сумма займа до
                    </label>
                    <input
                        type="number"
                        value={value.maxLoanAmount ?? ''}
                        onChange={handleNumberChange('maxLoanAmount')}
                        className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-white outline-none transition focus:border-zinc-600"
                    />
                </div>

                <div>
                    <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-zinc-500">
                        Доход / мес от
                    </label>
                    <input
                        type="number"
                        value={value.minMonthlyIncome ?? ''}
                        onChange={handleNumberChange('minMonthlyIncome')}
                        className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-white outline-none transition focus:border-zinc-600"
                    />
                </div>

                <div>
                    <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-zinc-500">
                        Доход / мес до
                    </label>
                    <input
                        type="number"
                        value={value.maxMonthlyIncome ?? ''}
                        onChange={handleNumberChange('maxMonthlyIncome')}
                        className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-white outline-none transition focus:border-zinc-600"
                    />
                </div>

                <div>
                    <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-zinc-500">
                        Ставка от
                    </label>
                    <input
                        type="number"
                        value={value.minInterestRateMonthly ?? ''}
                        onChange={handleNumberChange('minInterestRateMonthly')}
                        className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-white outline-none transition focus:border-zinc-600"
                    />
                </div>

                <div>
                    <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-zinc-500">
                        Ставка до
                    </label>
                    <input
                        type="number"
                        value={value.maxInterestRateMonthly ?? ''}
                        onChange={handleNumberChange('maxInterestRateMonthly')}
                        className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-white outline-none transition focus:border-zinc-600"
                    />
                </div>

                <div>
                    <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-zinc-500">
                        LTV до
                    </label>
                    <input
                        type="number"
                        value={value.maxLtv ?? ''}
                        onChange={handleNumberChange('maxLtv')}
                        className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-white outline-none transition focus:border-zinc-600"
                    />
                </div>

                <div>
                    <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-zinc-500">
                        Срок до (мес)
                    </label>
                    <input
                        type="number"
                        value={value.maxLoanTermMonths ?? ''}
                        onChange={handleNumberChange('maxLoanTermMonths')}
                        className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-white outline-none transition focus:border-zinc-600"
                    />
                </div>

                <div>
                    <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-zinc-500">
                        Источник
                    </label>

                    <SourceSelect
                        value={value.sourceId}
                        onChange={(sourceId) => {
                            onChange({
                                ...value,
                                sourceId,
                            });
                        }}
                    />
                </div>
            </div>
        </div>
    );
}