import { Op, Sequelize } from 'sequelize';
import { City } from '../../db/models/City.js';
import type {
    CityDto,
    GetCitiesQuery,
    SearchCitiesQuery,
} from './city.types.js';

function toNullableString(value: unknown): string | null {
    if (typeof value !== 'string') return null;

    const trimmed = value.trim();
    return trimmed ? trimmed : null;
}

function toNullableNumber(value: unknown): number | null {
    if (value === null || value === undefined) return null;

    const num = Number(value);
    return Number.isFinite(num) ? num : null;
}

function buildDisplayName(city: {
    name: string;
    regionName: string | null;
}): string {
    const parts = [city.name];

    if (city.regionName) {
        parts.push(city.regionName);
    }

    return parts.join(', ');
}

function mapCityToDto(city: City): CityDto {
    return {
        id: city.id,
        name: city.name,
        slug: city.slug,
        regionName: toNullableString(city.regionName),
        federalDistrict: toNullableString(city.federalDistrict),
        population: toNullableNumber(city.population),
        latitude: toNullableNumber(city.latitude),
        longitude: toNullableNumber(city.longitude),
        displayName: buildDisplayName({
            name: city.name,
            regionName: toNullableString(city.regionName),
        }),
    };
}

function normalizeLimit(limit: unknown, fallback: number, max: number): number {
    const num = Number(limit);

    if (!Number.isFinite(num) || num <= 0) {
        return fallback;
    }

    return Math.min(num, max);
}

function normalizeOffset(offset: unknown): number {
    const num = Number(offset);

    if (!Number.isFinite(num) || num < 0) {
        return 0;
    }

    return num;
}

function normalizeSearchQuery(value: string): string {
    return value
        .toLowerCase()
        .trim()
        .replace(/ё/g, 'е')
        .replace(/[.,]/g, ' ')
        .replace(/\s+/g, ' ');
}

function escapeLike(value: string): string {
    return value.replace(/[\\%_]/g, '\\$&');
}

export async function getCitiesService(query: GetCitiesQuery = {}): Promise<CityDto[]> {
    const limit = normalizeLimit(query.limit, 50, 100);
    const offset = normalizeOffset(query.offset);

    const cities = await City.findAll({
        order: [
            ['name', 'ASC'],
            ['id', 'ASC'],
        ],
        limit,
        offset,
    });

    return cities.map(mapCityToDto);
}

export async function getCityByIdService(id: number): Promise<CityDto | null> {
    const city = await City.findByPk(id);

    if (!city) {
        return null;
    }

    return mapCityToDto(city);
}

export async function searchCitiesService(query: SearchCitiesQuery): Promise<CityDto[]> {
    const normalizedQuery = normalizeSearchQuery(query.q || '');
    const limit = normalizeLimit(query.limit, 20, 50);

    if (!normalizedQuery) {
        return [];
    }

    const escapedQuery = escapeLike(normalizedQuery);

    const cities = await City.findAll({
        where: {
            [Op.or]: [
                Sequelize.where(
                    Sequelize.fn(
                        'replace',
                        Sequelize.fn('lower', Sequelize.col('name')),
                        'ё',
                        'е'
                    ),
                    {
                        [Op.like]: `%${escapedQuery}%`,
                    }
                ),
                Sequelize.where(
                    Sequelize.fn(
                        'replace',
                        Sequelize.fn('lower', Sequelize.col('regionName')),
                        'ё',
                        'е'
                    ),
                    {
                        [Op.like]: `%${escapedQuery}%`,
                    }
                ),
                Sequelize.where(
                    Sequelize.fn('lower', Sequelize.col('slug')),
                    {
                        [Op.like]: `%${escapedQuery}%`,
                    }
                ),
            ],
        },
        order: [
            ['population', 'DESC'],
            ['name', 'ASC'],
            ['id', 'ASC'],
        ],
        limit,
    });

    return cities.map(mapCityToDto);
}