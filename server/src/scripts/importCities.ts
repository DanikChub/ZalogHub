import fs from 'node:fs';
import path from 'node:path';
import { parse } from 'csv-parse/sync';
import { sequelize } from '../db/sequelize';
import { City } from '../db/models/City';

type CityCsvRow = {
    address?: string;
    postal_code?: string;
    country?: string;
    federal_district?: string;
    region_type?: string;
    region?: string;
    area_type?: string;
    area?: string;
    city_type?: string;
    city?: string;
    settlement_type?: string;
    settlement?: string;
    kladr_id?: string;
    fias_id?: string;
    fias_level?: string;
    capital_marker?: string;
    okato?: string;
    oktmo?: string;
    tax_office?: string;
    timezone?: string;
    geo_lat?: string;
    geo_lon?: string;
    population?: string;
    foundation_year?: string;
};

function normalizeSpaces(value: string): string {
    return value.replace(/\s+/g, ' ').trim();
}

function normalizeName(value: string): string {
    return normalizeSpaces(value).replace(/ё/gi, 'е');
}

function slugify(value: string): string {
    const map: Record<string, string> = {
        а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh', з: 'z',
        и: 'i', й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r',
        с: 's', т: 't', у: 'u', ф: 'f', х: 'h', ц: 'cz', ч: 'ch', ш: 'sh',
        щ: 'sch', ы: 'y', э: 'e', ю: 'yu', я: 'ya', ь: '', ъ: '',
    };

    return value
        .toLowerCase()
        .trim()
        .replace(/ё/g, 'е')
        .split('')
        .map((char) => map[char] ?? char)
        .join('')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .replace(/-{2,}/g, '-');
}

function parseNullableInt(value?: string): number | null {
    if (!value) return null;
    const normalized = value.trim();
    if (!normalized) return null;

    const result = Number(normalized);
    return Number.isFinite(result) ? result : null;
}

function parseNullableFloat(value?: string): number | null {
    if (!value) return null;
    const normalized = value.trim().replace(',', '.');
    if (!normalized) return null;

    const result = Number(normalized);
    return Number.isFinite(result) ? result : null;
}

function buildCityName(row: CityCsvRow): string | null {
    const city = row.city ? normalizeName(row.city) : '';
    if (city) return city;

    return null;
}

function buildRegionName(row: CityCsvRow): string | null {
    const region = row.region ? normalizeName(row.region) : '';
    return region || null;
}

async function main() {
    const csvPath = path.resolve(process.cwd(), 'storage/data/city.csv');

    if (!fs.existsSync(csvPath)) {
        throw new Error(`CSV file not found: ${csvPath}`);
    }

    const fileContent = fs.readFileSync(csvPath, 'utf-8');

    const rows = parse(fileContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
    }) as CityCsvRow[];

    const preparedMap = new Map<
        string,
        {
            name: string;
            slug: string;
            regionName: string | null;
            federalDistrict: string | null;
            population: number | null;
            latitude: number | null;
            longitude: number | null;
        }
    >();

    for (const row of rows) {
        const name = buildCityName(row);

        if (!name) {
            continue;
        }

        const regionName = buildRegionName(row);
        const federalDistrict = row.federal_district
            ? normalizeName(row.federal_district)
            : null;

        const baseSlug = slugify(name);
        const regionSlug = regionName ? slugify(regionName) : null;

        const slug = regionSlug ? `${baseSlug}-${regionSlug}` : baseSlug;

        if (!preparedMap.has(slug)) {
            preparedMap.set(slug, {
                name,
                slug,
                regionName,
                federalDistrict,
                population: parseNullableInt(row.population),
                latitude: parseNullableFloat(row.geo_lat),
                longitude: parseNullableFloat(row.geo_lon),
            });
        }
    }

    const preparedCities = Array.from(preparedMap.values());

    await sequelize.authenticate();

    for (const city of preparedCities) {
        await City.upsert(city);
    }

    console.log(`Imported cities: ${preparedCities.length}`);

    await sequelize.close();
}

main().catch(async (error) => {
    console.error('Failed to import cities:', error);
    try {
        await sequelize.close();
    } catch {}
    process.exit(1);
});