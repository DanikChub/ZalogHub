import { SourceParser } from '../../../core/types/parser.js';
import { ParsedDeal } from '../../../core/types/parsed-deal.js';

function parseMoney(value?: string | null): number | null {
    if (!value) return null;

    const digits = value.replace(/[^\d]/g, '');
    if (!digits) return null;

    return Number(digits);
}

function getTelegramContactUrlFromPost(text: string): string | null {
    const contactBlockMatch = text.match(
        /(?:свяжитесь|контакты|для уточнения деталей)[\s\S]{0,200}/i
    );

    const searchText = contactBlockMatch ? contactBlockMatch[0] : text;

    const match = searchText.match(/@([a-zA-Z0-9_]{4,32})/);

    if (!match) return null;

    return `https://t.me/${match[1]}`;
}

export const zalogDoveriyaParser: SourceParser = {
    sourceKey: 'telegram:zalog-doveriya',

    parse(raw) {
        console.log('🧩 [zalog-doveriya parser] triggered');
        console.log('🧩 [zalog-doveriya parser] text preview:', raw.text.slice(0, 200));

        const text = raw.text;

        const data: ParsedDeal = {
            source: 'Залог Доверия',
            externalId: null,
            type: null,
            objectName: null,
            address: null,
            objectParams: null,
            loanAmount: null,
            marketValue: null,
            creditorIncome: null,
            legalEntity: null,
            term: null,
            rate: null,
            dealType: null,
            contactUrl: null,
        };

        const reasons: string[] = [];
        let score = 0;

        // ID заявки
        const idMatch = text.match(/^(\d{4,6})k/m);
        if (idMatch) {
            data.externalId = idMatch[1];
            score += 0.05;
            reasons.push('externalId found');
        }

        // Тип объекта и название
        const typeMatch = text.match(/🏢\s*(.+)/);
        if (typeMatch) {
            const full = typeMatch[1].trim();
            const parts = full.split(' ');

            data.type = parts[0] || null;
            data.objectName = full;

            score += 0.15;
            reasons.push('type/objectName found');
        }

        // Адрес
        const addressMatch = text.match(/📍Адрес:\s*(.+)/);
        if (addressMatch) {
            data.address = addressMatch[1].trim();
            score += 0.15;
            reasons.push('address found');
        }

        // Параметры объекта
        const paramsMatch = text.match(/📐\s*Параметры объекта:\s*([\s\S]+?)\n\n💰/);
        if (paramsMatch) {
            data.objectParams = paramsMatch[1].trim();
            score += 0.05;
            reasons.push('objectParams found');
        }

        // Сумма займа
        const loanMatch = text.match(/Сумма займа:\s*([\d\s]+)\s*₽/);
        if (loanMatch) {
            data.loanAmount = parseMoney(loanMatch[1]);
            if (data.loanAmount !== null) {
                score += 0.35;
                reasons.push('loanAmount found');
            }
        }

        // Рыночная стоимость
        const marketMatch = text.match(/Рыночная стоимость:\s*([\d\s]+)\s*₽/);
        if (marketMatch) {
            data.marketValue = parseMoney(marketMatch[1]);
            if (data.marketValue !== null) {
                score += 0.1;
                reasons.push('marketValue found');
            }
        }

        // Доход кредитора
        const incomeMatch = text.match(/Доход кредитора:\s*([\d\s]+)\s*₽/);
        if (incomeMatch) {
            data.creditorIncome = parseMoney(incomeMatch[1]);
            if (data.creditorIncome !== null) {
                score += 0.03;
                reasons.push('creditorIncome found');
            }
        }

        // Юридическое лицо
        const legalMatch = text.match(/Статус заемщика:\s*(.+)/);
        if (legalMatch) {
            data.legalEntity = legalMatch[1].trim();
            score += 0.02;
            reasons.push('legalEntity found');
        }

        // Срок
        const termMatch = text.match(/Срок:\s*(.+)/);
        if (termMatch) {
            data.term = termMatch[1].trim();
            score += 0.04;
            reasons.push('term found');
        }

        // Ставка
        const rateMatch = text.match(/Ставка:\s*(.+)/);
        if (rateMatch) {
            data.rate = rateMatch[1].trim();
            score += 0.04;
            reasons.push('rate found');
        }

        // Тип сделки
        const dealMatch = text.match(/Тип сделки:\s*(.+)/);
        if (dealMatch) {
            data.dealType = dealMatch[1].trim();
            score += 0.02;
            reasons.push('dealType found');
        }

        // contactUrl
        const isContactUrl = getTelegramContactUrlFromPost(text)
        if (isContactUrl) {
            data.contactUrl = isContactUrl;
            score += 0.01;
            reasons.push('contactUrl found');
        }

        // Нормализация score
        if (score > 1) score = 1;

        // Минимальные требования для отправки
        const hasMinimumRequiredData =
            data.loanAmount !== null &&
            (data.address !== null || data.type !== null || data.objectName !== null);

        const shouldSend = hasMinimumRequiredData && score >= 0.45;

        if (!hasMinimumRequiredData) {
            reasons.push('minimum required fields not satisfied');
        }

        console.log('📊 [zalog-doveriya parser] score:', score);
        console.log('📊 [zalog-doveriya parser] reasons:', reasons);
        console.log('✅ [zalog-doveriya parser] parsed result:', data);

        return {
            parsed: hasMinimumRequiredData ? data : null,
            confidence: Number(score.toFixed(2)),
            shouldSend,
            reasons,
        };
    },
};