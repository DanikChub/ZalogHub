import { TelegramClient } from 'telegram';

type ResolvedChannelInfo = {
    id: string;          // без -100
    peerId: string;      // с -100
    title: string | null;
    username: string | null;
};

function toPlainChannelId(value: unknown): string | null {
    if (value == null) return null;

    if (typeof value === 'string') {
        return value.startsWith('-100') ? value.slice(4) : value;
    }

    if (typeof value === 'number') {
        const str = String(value);
        return str.startsWith('-100') ? str.slice(4) : str;
    }

    if (typeof value === 'object' && value && 'value' in (value as any)) {
        const str = String((value as any).value);
        return str.startsWith('-100') ? str.slice(4) : str;
    }

    return null;
}

export async function resolveChannelByUsername(
    client: TelegramClient,
    usernameOrLink: string,
): Promise<ResolvedChannelInfo | null> {
    const normalized = usernameOrLink
        .trim()
        .replace(/^https?:\/\/t\.me\//i, '')
        .replace(/^@/, '');

    const entity: any = await client.getEntity(normalized);

    const plainId = toPlainChannelId(entity?.id);
    if (!plainId) return null;

    return {
        id: plainId,
        peerId: `-100${plainId}`,
        title: entity?.title ?? null,
        username: entity?.username ?? null,
    };
}

export async function findChannelInDialogs(
    client: TelegramClient,
    query: string,
): Promise<ResolvedChannelInfo | null> {
    const dialogs = await client.getDialogs({});

    const normalizedQuery = query.trim().toLowerCase();

    for (const dialog of dialogs as any[]) {
        const title = String(dialog?.title ?? dialog?.name ?? '').trim();
        const username = String(dialog?.entity?.username ?? '').trim();

        const byTitle = title.toLowerCase().includes(normalizedQuery);
        const byUsername = username.toLowerCase() === normalizedQuery.replace(/^@/, '');

        if (!byTitle && !byUsername) continue;

        const plainId = toPlainChannelId(dialog?.id);
        if (!plainId) continue;

        return {
            id: plainId,
            peerId: `-100${plainId}`,
            title: title || null,
            username: username || null,
        };
    }

    return null;
}

export async function printAllChannels(client: TelegramClient) {
    const dialogs = await client.getDialogs({});

    for (const dialog of dialogs as any[]) {
        const title = String(dialog?.title ?? dialog?.name ?? '').trim();
        const username = String(dialog?.entity?.username ?? '').trim() || null;
        const plainId = toPlainChannelId(dialog?.id);

        if (!plainId) continue;

        console.log({
            title,
            username,
            id: plainId,
            peerId: `-100${plainId}`,
        });
    }
}