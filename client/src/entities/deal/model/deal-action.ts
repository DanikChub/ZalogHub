export type DealActionType = 'contact' | 'lead';

export type DealActionModalPayload = {
    type: DealActionType;
    title: string;
    url: string | null;
    objectName?: string | null;
    address?: string | null;
    loanAmount?: number | null;
};