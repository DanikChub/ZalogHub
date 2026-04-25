import { http } from '@/shared/api/http.ts';
import type {DealResponse, DealsQueryParams} from '../model/types';

export async function getDeals(params: DealsQueryParams = {}) {
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
        if (value === undefined || value === null || value === '') return;

        if (key === 'cities') return;

        if (Array.isArray(value)) {
            if (value.length === 0) return;
            searchParams.set(key, value.join(','));
            return;
        }

        searchParams.set(key, String(value));
    });

    const queryString = searchParams.toString();
    const url = queryString ? `/deals?${queryString}` : '/deals';

    const { data } = await http.get<DealResponse>(url);
    return data;
}