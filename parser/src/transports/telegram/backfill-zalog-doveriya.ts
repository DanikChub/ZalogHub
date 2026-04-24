import { TELEGRAM_SOURCES } from '../../core/registry/sourceRegistry.js';
import { processRawMessage } from '../../pipelines/processRawMessage.js';
import { downloadMessageImages } from './downloadMessageImages.js';

type BackfillZalogDoveriyaParams = {
    client: any;
    fromDate: Date;
    limit?: number;
};

export async function backfillZalogDoveriya({
                                                client,
                                                fromDate,
                                                limit = 1000,
                                            }: BackfillZalogDoveriyaParams) {
    const source = TELEGRAM_SOURCES.ZALOG_DOVERIYA;

    console.log('🚀 [backfill] starting Zalog Doveriya backfill...');
    console.log('📡 [backfill] channelId:', source.channelId);
    console.log('📅 [backfill] fromDate:', fromDate.toISOString());
    console.log('🔢 [backfill] limit:', limit);

    const entity = await client.getEntity(source.channelId);

    let processed = 0;
    let skippedEmpty = 0;
    let stoppedByDate = false;

    for await (const msg of client.iterMessages(entity, { limit })) {
        try {
            const msgDate = new Date(msg.date * 1000);

            const channelId = '-100' + msg.peerId.channelId;

            if (msgDate < fromDate) {
                console.log('🛑 [backfill] reached messages older than fromDate, stopping');
                stoppedByDate = true;
                break;
            }

            if (!msg?.message && !msg?.media) {
                skippedEmpty++;
                continue;
            }

            const chat = await msg.getChat();

            console.log('📩 [backfill] processing message:', {
                id: msg.id,
                date: msgDate.toISOString(),
                textPreview: String(msg.message || '').slice(0, 120),
            });

            const images = await downloadMessageImages(client, msg);

            const raw = {
                sourceType: 'telegram' as const,
                sourceKey: source.key,
                externalMessageId: String(msg.id),
                sourceChannelId: channelId,
                publishedAt: msgDate.toISOString(),
                text: msg.message || '',
                url: null,
                images,
                metadata: {
                    channelId: source.channelId,
                    title: chat?.title ?? source.title,
                },
            };

            await processRawMessage(raw);

            processed++;

            console.log('✅ [backfill] processed message:', {
                id: msg.id,
                processed,
            });

            // небольшая пауза, чтобы не долбить Telegram слишком резко
            await new Promise((resolve) => setTimeout(resolve, 150));
        } catch (error) {
            console.error('❌ [backfill] error while processing message:', {
                messageId: msg?.id,
                error,
            });
        }
    }

    console.log('🏁 [backfill] Zalog Doveriya backfill finished');
    console.log('📊 [backfill] stats:', {
        processed,
        skippedEmpty,
        stoppedByDate,
    });
}