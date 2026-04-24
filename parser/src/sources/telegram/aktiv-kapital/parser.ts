import { SourceParser } from '../../../core/types/parser.js';

export const aktivKapitalParser: SourceParser = {
    sourceKey: 'telegram:aktiv-kapital',

    parse(raw) {
        const text = raw.text;

        if (!text.includes('Сумма запроса')) return null;

        return {
            source: 'Актив Капитал',
            loanAmount: parseInt(
                text.match(/Сумма запроса:\s*([\d\s]+)/)?.[1].replace(/\s/g, '') || '0',
                10,
            ),
        };
    },
};