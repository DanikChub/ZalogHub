import { Source } from '../../db/models/Source.js';
import { ParsedDealFields, RawMessage } from '../deals/deal.types.js';

export type DealParserResult = {
    shouldSave: boolean;
    parsed: ParsedDealFields | null;
    reason?: string | null;
};

export type DealParser = {
    key: string;
    parse: (raw: RawMessage, source: Source) => DealParserResult;
};