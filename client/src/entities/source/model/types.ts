export type Source = {
    id: number;
    name: string;
    type: string;
    key: string;
    externalId: string | null;
    title: string | null;
    url: string | null;
    isActive?: boolean;
    parseEnabled?: boolean;
};

export type SourcesResponse = {
    ok: boolean;
    items: Source[];
};