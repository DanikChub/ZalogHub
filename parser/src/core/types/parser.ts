import { RawMessage } from './raw-message.js';
import { ParsedDeal } from './parsed-deal.js';

export type ParseResult = {
    parsed: ParsedDeal | null;
    confidence: number; // 0..1
    shouldSend: boolean;
    reasons: string[];
};

export interface SourceParser {
    sourceKey: string;
    parse(raw: RawMessage): ParseResult;
}