export type RawMessageImage = {
    tempPath: string;
    filename: string;
    mimeType: string | null;
};

export type RawMessage = {
    sourceType: 'telegram';
    sourceId: number;

    sourceChannelId: string | null;
    sourceTitle: string | null;

    externalMessageId: string;
    publishedAt: string;
    text: string;
    url?: string | null;
    images?: RawMessageImage[];

    metadata?: Record<string, unknown>;
};