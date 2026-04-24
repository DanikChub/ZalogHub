import { Op, fn, col, where } from 'sequelize';
import { City } from '../../db/models/City';


const MILLION_PLUS_CITY_NAMES = [
    'Москва',
    'Санкт-Петербург',
    'Новосибирск',
    'Екатеринбург',
    'Казань',
    'Нижний Новгород',
    'Красноярск',
    'Челябинск',
    'Самара',
    'Уфа',
    'Ростов-на-Дону',
    'Омск',
    'Краснодар',
    'Воронеж',
    'Пермь',
    'Волгоград',
];

function normalizeCityString(value: string): string {
    return value
        .toLowerCase()
        .trim()
        .replace(/ё/g, 'е')
        .replace(/[.,/\\]/g, ' ')
        .replace(/-/g, ' ')
        .replace(/\s+/g, ' ')
        .replace(/^г\s+/g, '')
        .replace(/^г\.\s*/g, '')
        .replace(/^город\s+/g, '')
        .replace(/\bроссия\b/g, '')
        .replace(/\bрф\b/g, '')
        .replace(/\bобласть\b/g, '')
        .replace(/\bобл\b/g, '')
        .replace(/\bкрай\b/g, '')
        .replace(/\bреспублика\b/g, '')
        .replace(/\bресп\b/g, '')
        .replace(/\bрайон\b/g, '')
        .replace(/\bр н\b/g, '')
        .replace(/\bмуниципальный\b/g, '')
        .replace(/\bокруг\b/g, '')
        .replace(/\s+/g, ' ')
        .trim();
}

function cleanupExtractedCity(value: string): string {
    return value
        .trim()
        .replace(/\s+/g, ' ')
        .replace(/[,\-–—]+$/g, '')
        .trim();
}

async function findMillionPlusCityFromText(text: string): Promise<{
    cityId: number | null;
    parsedCityRaw: string | null;
}> {
    const normalizedText = normalizeCityString(text);

    if (!normalizedText) {
        return {
            cityId: null,
            parsedCityRaw: null,
        };
    }

    for (const cityName of MILLION_PLUS_CITY_NAMES) {
        const canonicalCityName = applyCityAlias(cityName);

        const pattern = new RegExp(
            `(^|\\s)${canonicalCityName.replace(/\s+/g, '\\s+')}(\\s|$)`,
            'i',
        );

        if (!pattern.test(normalizedText)) continue;

        const cityId = await findCityIdByName(cityName);

        if (cityId) {
            return {
                cityId,
                parsedCityRaw: cityName,
            };
        }
    }

    return {
        cityId: null,
        parsedCityRaw: null,
    };
}

function extractCityFromAddress(address?: string | null): string | null {
    if (!address) return null;

    const value = address.trim();
    if (!value) return null;

    const patterns = [
        /г\.\s*([А-Яа-яЁё\- ]+)/i,
        /г\s+([А-Яа-яЁё\- ]+)/i,
        /город\s+([А-Яа-яЁё\- ]+)/i,
    ];

    for (const pattern of patterns) {
        const match = value.match(pattern);
        if (match?.[1]) {
            return cleanupExtractedCity(match[1]);
        }
    }

    // "Санкт-Петербург, Россия"
    const firstPart = value.split(',')[0]?.trim();
    if (firstPart) {
        return cleanupExtractedCity(firstPart);
    }

    return null;
}

function extractCityFromTitle(title?: string | null): string | null {
    if (!title) return null;

    const value = title.trim();
    if (!value) return null;

    const patterns = [
        /в\s+г\.\s*([А-Яа-яЁё\- ]+)/i,
        /в\s+г\s+([А-Яа-яЁё\- ]+)/i,
        /в\s+городе\s+([А-Яа-яЁё\- ]+)/i,
        /в\s+([А-Яа-яЁё\- ]+)/i,
    ];

    for (const pattern of patterns) {
        const match = value.match(pattern);
        if (match?.[1]) {
            return cleanupExtractedCity(match[1]);
        }
    }

    return null;
}

const CITY_ALIASES: Record<string, string> = {
    'мск': 'москва',
    'москва': 'москва',

    'спб': 'санкт петербург',
    'питер': 'санкт петербург',
    'санкт': 'санкт петербург',
    'санкт петербург': 'санкт петербург',
    'санкт-петербург': 'санкт петербург',

    'нн': 'нижний новгород',
    'н новгород': 'нижний новгород',
    'нижний новгород': 'нижний новгород',

    'екб': 'екатеринбург',
    'екат': 'екатеринбург',
};

function applyCityAlias(value: string): string {
    const normalized = normalizeCityString(value);
    return CITY_ALIASES[normalized] || normalized;
}

async function findCityIdByName(rawCity: string): Promise<number | null> {
    const canonical = applyCityAlias(rawCity);

    // 1. Точное совпадение по нормализованному имени
    const exactCity = await City.findOne({
        where: where(
            fn(
                'replace',
                fn(
                    'replace',
                    fn(
                        'replace',
                        fn('lower', col('name')),
                        'ё',
                        'е',
                    ),
                    '-',
                    ' ',
                ),
                '.',
                '',
            ),
            canonical,
        ),
    });

    if (exactCity) {
        return exactCity.id;
    }

    // 2. Частичное совпадение: если, например, "санкт" или "спб"
    const partialCity = await City.findOne({
        where: {
            name: {
                [Op.iLike]: `%${canonical}%`,
            },
        },
        order: [['name', 'ASC']],
    });

    if (partialCity) {
        return partialCity.id;
    }

    return null;
}

async function findCityIdFromTextByDictionary(text: string): Promise<{ cityId: number | null; parsedCityRaw: string | null }> {
    const normalizedText = normalizeCityString(text);
    if (!normalizedText) {
        return { cityId: null, parsedCityRaw: null };
    }

    const cities = await City.findAll({
        attributes: ['id', 'name'],
    });

    for (const city of cities) {
        const normalizedCityName = normalizeCityString(city.name);

        if (!normalizedCityName) continue;

        const pattern = new RegExp(`(^|\\s)${normalizedCityName}(\\s|$)`, 'i');

        if (pattern.test(normalizedText)) {
            return {
                cityId: city.id,
                parsedCityRaw: city.name,
            };
        }
    }

    return {
        cityId: null,
        parsedCityRaw: null,
    };
}

export async function resolveDealCity(input: {
    address?: string | null;
    objectName?: string | null;
    rawText?: string | null;
}) {
    const candidates = [
        extractCityFromAddress(input.address),
        extractCityFromTitle(input.objectName),
    ].filter(Boolean) as string[];

    // Сначала пытаемся по явным кандидатам
    for (const candidate of candidates) {
        const cityId = await findCityIdByName(candidate);

        if (cityId) {
            return {
                parsedCityRaw: candidate,
                cityId,
            };
        }
    }

    // Если не нашли, сначала ищем крупные города по всему тексту
    if (input.rawText) {
        const millionPlusFallback = await findMillionPlusCityFromText(input.rawText);

        if (millionPlusFallback.cityId) {
            return millionPlusFallback;
        }

        const fallback = await findCityIdFromTextByDictionary(input.rawText);

        if (fallback.cityId) {
            return fallback;
        }
    }

    // Если ничего не нашли, но кандидат был — сохраняем его хотя бы как raw
    if (candidates.length > 0) {
        return {
            parsedCityRaw: candidates[0],
            cityId: null,
        };
    }

    return {
        parsedCityRaw: null,
        cityId: null,
    };
}