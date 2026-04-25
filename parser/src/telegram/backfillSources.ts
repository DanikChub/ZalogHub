import { TelegramClient } from 'telegram';
import { ParserSourceConfig } from '../core/types/source-config.js';
import { handleTelegramMessageGroup } from './handleTelegramMessage.js';

type BackfillSourceParams = {
    client: TelegramClient;
    source: ParserSourceConfig;
    fromDate: Date;
    limit?: number;
    delayMs?: number;
};

type MessageGroup = {
    mainMessage: any;
    messages: any[];
};

function getMessageGroupKey(msg: any): string {
    if (msg.groupedId) {
        return `group:${msg.groupedId.toString()}`;
    }

    return `single:${msg.id}`;
}

function groupTelegramMessages(messages: any[]): MessageGroup[] {
    const groups = new Map<string, any[]>();

    for (const msg of messages) {
        const key = getMessageGroupKey(msg);
        const current = groups.get(key) ?? [];

        current.push(msg);
        groups.set(key, current);
    }

    return Array.from(groups.values())
        .map((items) => {
            items.sort((a, b) => a.id - b.id);

            const textMessage =
                items.find((item) => item.message?.trim()) ?? items[0];

            return {
                mainMessage: textMessage,
                messages: items,
            };
        })
        .sort((a, b) => b.mainMessage.date - a.mainMessage.date);
}

export async function backfillSource({
                                         client,
                                         source,
                                         fromDate,
                                         limit = 1000,
                                         delayMs = 150,
                                     }: BackfillSourceParams) {
    if (!source.channelId) {
        console.warn('backfill skipped: source has no channelId', source.id);
        return;
    }

    const entityRef = String(source.channelId).startsWith('-100')
        ? String(source.channelId)
        : `-100${source.channelId}`;

    console.log('🚀 [backfill] start:', {
        sourceId: source.id,
        title: source.title,
        entityRef,
        fromDate: fromDate.toISOString(),
        limit,
        parseImages: source.parseImages,
    });

    const collectedMessages: any[] = [];

    let scanned = 0;
    let skippedEmpty = 0;
    let stoppedByDate = false;

    for await (const msg of client.iterMessages(entityRef, { limit })) {
        try {
            const msgDate = new Date(msg.date * 1000);

            if (msgDate < fromDate) {
                stoppedByDate = true;
                console.log('🛑 [backfill] reached older messages, stop:', {
                    sourceId: source.id,
                    messageId: msg.id,
                    msgDate: msgDate.toISOString(),
                });
                break;
            }

            if (!msg?.message && !msg?.media) {
                skippedEmpty++;
                continue;
            }

            collectedMessages.push(msg);
            scanned++;
        } catch (error) {
            console.error('❌ [backfill] collect message error:', {
                sourceId: source.id,
                messageId: msg?.id,
                error,
            });
        }
    }

    const groups = groupTelegramMessages(collectedMessages);

    let processedGroups = 0;

    for (const group of groups) {
        try {
            const msgDate = new Date(group.mainMessage.date * 1000);

            console.log('📩 [backfill] processing group:', {
                sourceId: source.id,
                mainMessageId: group.mainMessage.id,
                messageIds: group.messages.map((msg) => msg.id),
                imagesInGroup: group.messages.filter((msg) => msg.media).length,
                msgDate: msgDate.toISOString(),
                preview: String(group.mainMessage.message || '').slice(0, 100),
            });

            await handleTelegramMessageGroup(client, group.messages, source);

            processedGroups++;

            if (delayMs > 0) {
                await new Promise((resolve) => setTimeout(resolve, delayMs));
            }
        } catch (error) {
            console.error('❌ [backfill] group error:', {
                sourceId: source.id,
                mainMessageId: group.mainMessage?.id,
                messageIds: group.messages.map((msg) => msg.id),
                error,
            });
        }
    }

    console.log('🏁 [backfill] finished:', {
        sourceId: source.id,
        scanned,
        collected: collectedMessages.length,
        groups: groups.length,
        processedGroups,
        skippedEmpty,
        stoppedByDate,
    });
}