export type BorrowerType =
    | 'individual'
    | 'self_employed'
    | 'sole_proprietor'
    | 'company';

export function parseMoney(value?: string | null): number | null {
    if (!value) return null;

    const digits = value.replace(/[^\d]/g, '');
    if (!digits) return null;

    const num = Number(digits);
    return Number.isFinite(num) ? num : null;
}

export function parseInterestRateMonthly(value?: string | null): number | null {
    if (!value) return null;

    const normalized = value.toLowerCase().trim();

    const normalizeMonthlyRate = (rate: number): number | null => {
        if (!Number.isFinite(rate)) return null;

        // защита от "60% в месяц" / "60%" — почти точно годовая
        if (rate > 16) {
            return Number((rate / 12).toFixed(2));
        }

        return rate;
    };

    // 1. ЯВНАЯ месячная ставка: "5% в мес", "5% месяц", "5%/мес"
    const monthlyMatch = normalized.match(
        /(\d+(?:[.,]\d+)?)\s*%?\s*(?:в\s*)?(?:мес|месяц|месяца|месяцев|\/мес)/i,
    );

    if (monthlyMatch?.[1]) {
        const monthlyRate = Number(monthlyMatch[1].replace(',', '.'));
        return normalizeMonthlyRate(monthlyRate);
    }

    // 2. ЯВНАЯ годовая ставка: "60% годовых", "60% в год", "60%/год"
    const yearlyMatch = normalized.match(
        /(\d+(?:[.,]\d+)?)\s*%?\s*(?:годовых|в\s*год|\/год|год)/i,
    );

    if (yearlyMatch?.[1]) {
        const yearlyRate = Number(yearlyMatch[1].replace(',', '.'));

        if (!Number.isFinite(yearlyRate)) return null;

        // защита от "3% в год" — почти точно имели в виду 3% в месяц
        if (yearlyRate < 20) {
            return yearlyRate;
        }

        return Number((yearlyRate / 12).toFixed(2));
    }

    // 3. Просто "5%" — считаем месячной, но защищаемся от "60%"
    const anyRateMatch = normalized.match(/(\d+(?:[.,]\d+)?)/);

    if (!anyRateMatch?.[1]) return null;

    const rawRate = Number(anyRateMatch[1].replace(',', '.'));

    return normalizeMonthlyRate(rawRate);
}

export function parseLoanTermMonths(value?: string | null): number | null {
    if (!value) return null;

    const normalized = value.toLowerCase().trim();

    if (normalized.includes('полгода')) return 6;

    const monthMatch = normalized.match(/(\d+(?:[.,]\d+)?)\s*(?:мес|месяц|месяца|месяцев)/i);
    if (monthMatch?.[1]) {
        const num = Number(monthMatch[1].replace(',', '.'));
        return Number.isFinite(num) ? Math.round(num) : null;
    }

    const yearMatch = normalized.match(/(\d+(?:[.,]\d+)?)\s*(?:год|года|лет)/i);
    if (yearMatch?.[1]) {
        const years = Number(yearMatch[1].replace(',', '.'));
        return Number.isFinite(years) ? Math.round(years * 12) : null;
    }

    return null;
}

export function mapBorrowerType(value?: string | null): BorrowerType | null {
    if (!value) return null;

    const normalized = value.toLowerCase().trim();

    if (
        normalized.includes('смз') ||
        normalized.includes('сз') ||
        normalized.includes('самозан')
    ) {
        return 'self_employed';
    }

    if (
        normalized === 'ип' ||
        normalized.includes(' ип') ||
        normalized.includes('ип ') ||
        normalized.includes('индивидуальный предприниматель')
    ) {
        return 'sole_proprietor';
    }

    if (
        normalized.includes('юр') ||
        normalized.includes('ооо') ||
        normalized.includes('зао') ||
        normalized.includes('ао') ||
        normalized.includes('компан')
    ) {
        return 'company';
    }

    if (
        normalized.includes('физ') ||
        normalized.includes('частн') ||
        normalized.includes('нет')
    ) {
        return 'individual';
    }

    return null;
}

export function cleanInlineText(value: string): string {
    return value
        .replace(/\n/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

export function detectObjectType(value?: string | null): string | null {
    if (!value) return null;

    const lower = value.toLowerCase();

    if (lower.includes('квартира')) return 'квартира';
    if (lower.includes('апартамент')) return 'апартаменты';
    if (lower.includes('дом')) return 'дом';
    if (lower.includes('участ')) return 'участок';
    if (lower.includes('коммер')) return 'коммерческая недвижимость';
    if (lower.includes('машиноместо')) return 'машиноместо';
    if (lower.includes('гараж')) return 'гараж';

    return value.split(/\s+/)[0] || null;
}

export function getTelegramContactUrlFromPost(text: string): string | null {
    if (!text) return null;

    // 1. Ищем блок с контактом (расширенный список триггеров)
    const contactBlockMatch = text.match(
        /(?:свяжитесь|контакты|для уточнения деталей|обращаться|писать|узнать|подробно|👨🏻‍💻|📞|👉)[\s\S]{0,250}/i,
    );

    const searchText = contactBlockMatch ? contactBlockMatch[0] : text;

    // 2. Ищем username (но избегаем хэштегов)
    const match = searchText.match(/(?:^|\s)@([a-zA-Z0-9_]{4,32})/);

    if (match?.[1]) {
        return `https://t.me/${match[1]}`;
    }

    // 3. Fallback: ищем в конце поста (часто там контакт)
    const tail = text.slice(-300);

    const fallbackMatch = tail.match(/(?:^|\s)@([a-zA-Z0-9_]{4,32})/);

    if (fallbackMatch?.[1]) {
        return `https://t.me/${fallbackMatch[1]}`;
    }

    return null;
}