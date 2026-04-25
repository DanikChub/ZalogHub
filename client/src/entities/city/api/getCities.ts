import { http } from '@/shared/api/http.ts';
import type {City, GetCitiesParams} from "@/entities/city/model/types.ts";

export async function getCities(params: GetCitiesParams = {}) {
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
        if (value === undefined || value === null) return;
        searchParams.set(key, String(value));
    });

    const queryString = searchParams.toString();
    const url = queryString ? `/api/cities?${queryString}` : '/api/cities';

    const { data } = await http.get<City[]>(url);
    return data;
}