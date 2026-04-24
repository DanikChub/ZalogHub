import { http } from '@/shared/api/http.ts';
import type { City } from '../model/types.ts';

export async function getCityById(id: number) {
    const { data } = await http.get<City>(`/api/cities/${id}`);
    return data;
}