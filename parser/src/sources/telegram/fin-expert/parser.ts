import { SourceParser } from '../../../core/types/parser.js';

export const finExpertParser: SourceParser = {
    sourceKey: 'telegram:fin-expert',

    parse(raw) {
        const text = raw.text;

        if (!text.includes('Сумма займа')) return null;

        return {
            source: 'Финансовый Эксперт',
            loanAmount: parseInt(
                text.match(/Сумма займа:\s*([\d\s]+)/)?.[1].replace(/\s/g, '') || '0',
                10,
            ),
        };
    },
};