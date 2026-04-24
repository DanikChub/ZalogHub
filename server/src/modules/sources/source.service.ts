import { Source } from '../../db/models/Source.js';

export async function getParserSources() {
    const items = await Source.findAll({
        where: {
            isActive: true,
            parseEnabled: true,
            type: 'telegram_channel',
        },
        order: [['id', 'ASC']],
    });

    return items.map((source) => ({
        id: source.id,
        name: source.name,
        type: source.type,
        key: source.key,
        title: source.title ?? source.name,
        channelId: source.externalId, // telegram channel id
        url: source.url ?? null,
        parseEnabled: source.parseEnabled,
        parseImages: source.parseImages,
        isActive: source.isActive,
    }));
}