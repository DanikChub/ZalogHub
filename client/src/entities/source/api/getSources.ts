import { http } from '@/shared/api/http.ts';
import type {Source, SourcesResponse} from "@/entities/source/model/types.ts";


export async function getSources(): Promise<Source[]> {
    const { data } = await http.get<SourcesResponse | Source[]>('/parser/sources');

    if (Array.isArray(data)) {
        return data;
    }

    return data.items ?? [];
}