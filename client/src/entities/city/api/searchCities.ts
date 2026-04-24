import { http } from '@/shared/api/http.ts';
import type { City, SearchCitiesParams } from '../model/types.ts';

export async function searchCities(params: SearchCitiesParams) {
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
        if (value === undefined || value === null || value === '') return;
        searchParams.set(key, String(value));
    });

    const { data } = await http.get<City[]>(`/api/cities/search?${searchParams.toString()}`);
    return data;
}