import { TelegramClient } from 'telegram';
import { getSources } from '../integrations/api/getSources.js';
import { backfillSource } from './backfillSources.js';

type BackfillAllSourcesParams = {
    client: TelegramClient;
    fromDate: Date;
    perSourceLimit?: number;
    delayMs?: number;
};

export async function backfillAllSources({
                                             client,
                                             fromDate,
                                             perSourceLimit = 2000,
                                             delayMs = 150,
                                         }: BackfillAllSourcesParams) {
    const sources = await getSources();

    for (const source of sources) {
        if (!source.isActive || !source.parseEnabled || !source.channelId) {
            continue;
        }

        try {
            await backfillSource({
                client,
                source,
                fromDate,
                limit: perSourceLimit,
                delayMs,
            });
        } catch (error) {
            console.error('❌ [backfill] source failed:', {
                sourceId: source.id,
                title: source.title,
                error,
            });
        }
    }
}