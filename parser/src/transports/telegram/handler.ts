import { NewMessage } from 'telegram/events/index.js';
import { telegramSourceByChannelId } from '../../core/registry/sourceRegistry.js';
import { processRawMessage } from '../../pipelines/processRawMessage.js';
import { downloadMessageImages } from './downloadMessageImages.js';

export function registerTelegramHandlers(client: any) {
    console.log('🪝 [telegram-handler] registering NewMessage handler...');

    client.addEventHandler(
        async (event: any) => {
            console.log('📩 [telegram-handler] new message event received');

            try {
                const msg = event.message;

                if (!msg?.message && !msg?.media) {
                    console.log('⚠️ [telegram-handler] no text and no media, skipped');
                    return;
                }

                const chat = await msg.getChat();
                const channelId = '-100' + msg.peerId.channelId;
д
                console.log('📡 [telegram-handler] channelId:', channelId);
                console.log('📝 [telegram-handler] chat title:', chat?.title);
                console.log('📝 [telegram-handler] text preview:', String(msg.message || '').slice(0, 200));

                const source = telegramSourceByChannelId[channelId];

                if (!source) {
                    console.log('⚠️ [telegram-handler] source not found for channelId:', channelId);
                    return;
                }

                const images = await downloadMessageImages(client, msg);

                console.log('🖼️ [telegram-handler] downloaded images:', images.length);

                const raw = {
                    sourceType: 'telegram' as const,
                    sourceKey: source.key,
                    sourceChannelId: channelId,
                    externalMessageId: String(msg.id),
                    publishedAt: new Date(msg.date * 1000).toISOString(),
                    text: msg.message || '',
                    url: null,
                    images,
                    metadata: {
                        channelId,
                        title: chat.title,
                    },
                };

                console.log('📦 [telegram-handler] raw message prepared:', {
                    ...raw,
                    images: raw.images?.map((img) => img.filename),
                });

                await processRawMessage(raw);

                console.log('✅ [telegram-handler] raw message processed');
            } catch (error) {
                console.error('❌ [telegram-handler] handler error:', error);
            }
        },
        new NewMessage({}),
    );

    console.log('✅ [telegram-handler] NewMessage handler registered');
}