export const TELEGRAM_SOURCES = {
    ZALOG_DOVERIYA: {
        key: 'telegram:zalog-doveriya',
        channelId: '-1001362154501',
        title: 'Залог Доверия',
    },
    AKTIV_KAPITAL: {
        key: 'telegram:aktiv-kapital',
        channelId: '-1003511512495',
        title: 'Актив Капитал',
    },
    FIN_EXPERT: {
        key: 'telegram:fin-expert',
        channelId: '-1000000000000',
        title: 'Финансовый Эксперт',
    },
    MOS_INVEST_FINANCE: {
        key: 'telegram:MOS_INVEST_FINANCE',
        channelId: '-1001692723300',
        title: 'Мос Инвест Финанс',
    },
} as const;

export const telegramSourceByChannelId = Object.values(
    TELEGRAM_SOURCES,
).reduce((acc, source) => {
    acc[source.channelId] = source;
    return acc;
}, {} as Record<string, (typeof TELEGRAM_SOURCES)[keyof typeof TELEGRAM_SOURCES]>);

console.log('📚 [sourceRegistry] registered telegram sources:', telegramSourceByChannelId);