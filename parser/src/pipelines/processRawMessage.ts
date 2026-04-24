import { parserRegistry } from '../core/registry/parserRegistry.js';
import { sendDeal } from '../integrations/api/sendDeal.js';
import { RawMessage } from '../core/types/raw-message.js';
import {buildSourceUrl} from "../core/utils/buildSourceUrl.js";

export async function processRawMessage(raw: RawMessage) {
    console.log('⚙️ [pipeline] processing raw message...');
    console.log('🔑 [pipeline] sourceKey:', raw.sourceKey);
    console.log('🆔 [pipeline] externalMessageId:', raw.externalMessageId);

    const parser = parserRegistry.get(raw.sourceKey);

    if (!parser) {
        console.warn('⚠️ [pipeline] no parser found for sourceKey:', raw.sourceKey);
        console.log('📚 [pipeline] available parser keys:', Array.from(parserRegistry.keys()));
        return;
    }

    console.log('✅ [pipeline] parser found:', parser.sourceKey);

    const result = parser.parse(raw);

    console.log('📊 [pipeline] parse result:', {
        confidence: result.confidence,
        shouldSend: result.shouldSend,
        reasons: result.reasons,
    });

    if (!result.parsed) {
        console.warn('⚠️ [pipeline] parser returned null parsed result');
        return;
    }

    if (!result.shouldSend) {
        console.warn('⚠️ [pipeline] parser decided not to send');
        return;
    }

    const sourceUrl = buildSourceUrl(raw);
    console.log('sourceUrl:', sourceUrl);
    await sendDeal({
        raw: {
            ...raw,
            url: sourceUrl,
        },
        parsed: result.parsed,
        parserMeta: {
            confidence: result.confidence,
            reasons: result.reasons,
        },
    });

    console.log('✅ [pipeline] deal sent to server');
}