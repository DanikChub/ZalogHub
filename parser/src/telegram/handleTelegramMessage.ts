import { sendDeal } from '../integrations/api/sendDeal.js';
import { downloadMessageImages } from './downloadMessageImages.js';
import { ParserSourceConfig } from '../core/types/source-config.js';

function getMessageText(messages: any[]): string {
    const textMessage = messages.find((msg) => msg.message?.trim());
    return textMessage?.message?.trim() ?? '';
}

function getMainMessage(messages: any[]) {
    return messages.find((msg) => msg.message?.trim()) ?? messages[0];
}

export async function handleTelegramMessageGroup(
    client: any,
    messages: any[],
    source: ParserSourceConfig,
) {
    try {
        if (!messages.length) return;

        const mainMessage = getMainMessage(messages);
        const text = getMessageText(messages);

        // Если в группе вообще нет текста — это не заявка
        if (!text) {
            console.log('telegram group skipped: empty_text', {
                sourceId: source.id,
                messageIds: messages.map((msg) => msg.id),
            });
            return;
        }

        const msgDate = new Date(mainMessage.date * 1000);
        const chat = await mainMessage.getChat();

        const images = source.parseImages
            ? (
                await Promise.all(
                    messages
                        .filter((msg) => msg?.media)
                        .map((msg) => downloadMessageImages(client, msg)),
                )
            ).flat()
            : [];

        const channelUrl =
            typeof chat?.username === 'string' && chat.username
                ? `https://t.me/${chat.username}`
                : null;

        const postUrl =
            typeof chat?.username === 'string' && chat.username
                ? `https://t.me/${chat.username}/${mainMessage.id}`
                : null;

        const raw = {
            sourceType: 'telegram' as const,
            sourceId: source.id,

            sourceChannelId: source.channelId ?? null,
            sourceTitle: chat?.title ?? source.title ?? null,

            externalMessageId: String(mainMessage.id),
            publishedAt: msgDate.toISOString(),
            text,
            url: postUrl,
            images,

            metadata: {
                channelUrl,
                actualTitle: chat?.title ?? null,
                actualUsername: chat?.username ?? null,
                parseImages: source.parseImages,
                groupedId: mainMessage.groupedId?.toString?.() ?? null,
                messageIds: messages.map((msg) => msg.id),
            },
        };

        const result = await sendDeal({ raw });

        console.log('sendDeal group result', {
            sourceId: source.id,
            externalMessageId: raw.externalMessageId,
            imagesCount: images.length,
            messageIds: raw.metadata.messageIds,
            result,
        });
    } catch (error) {
        console.error('handleTelegramMessageGroup error', error);
    }
}

export async function handleTelegramMessage(
    client: any,
    msg: any,
    source: ParserSourceConfig,
) {
    return handleTelegramMessageGroup(client, [msg], source);
}