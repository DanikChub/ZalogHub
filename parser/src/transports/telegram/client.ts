import { TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions/index.js';
import { env } from '../../config/env.js';

const session = new StringSession(env.tgSession);

console.log('🔧 [telegram-client] env check:', {
    hasApiId: Boolean(env.tgApiId),
    hasApiHash: Boolean(env.tgApiHash),
    hasSession: Boolean(env.tgSession),
});

export const client = new TelegramClient(
    session,
    env.tgApiId,
    env.tgApiHash,
    { connectionRetries: 5 },
);

export async function initClient() {
    console.log('⏳ [telegram-client] connecting to Telegram...');

    await client.connect();
    const entity = await client.getEntity('mosinvestfinans_partners');
    const channelId = Number(entity.id.value);
    const peerId = Number(`-100${channelId}`);
    console.log(peerId); // 1692723300
    console.log('✅ [telegram-client] connected to Telegram');
    console.log('🆔 [telegram-client] session length:', env.tgSession?.length || 0);
}