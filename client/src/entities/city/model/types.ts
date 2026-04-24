export type City = {
    id: number;
    name: string;
    slug: string;
    regionName: string | null;
    federalDistrict: string | null;
    population: number | null;
    latitude: number | null;
    longitude: number | null;
    displayName: string;
};

export type GetCitiesParams = {
    limit?: number;
    offset?: number;
};

export type SearchCitiesParams = {
    q: string;
    limit?: number;
};