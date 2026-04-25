export type ParserSourceConfig = {
    id: number;
    name: string;
    title: string | null;
    key: string;

    channelId: string | null;
    url?: string | null;

    isActive: boolean;
    parseEnabled: boolean;
    parseImages: boolean;
};