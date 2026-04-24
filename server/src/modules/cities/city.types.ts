export type CityDto = {
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

export type GetCitiesQuery = {
    limit?: number;
    offset?: number;
};

export type SearchCitiesQuery = {
    q: string;
    limit?: number;
};

export type GetCityByIdParams = {
    id: number;
};