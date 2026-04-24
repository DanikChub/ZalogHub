export type ParsedDeal = {
    source: string;
    externalId?: string | number | null;
    type?: string | null;
    objectName?: string | null;
    address?: string | null;
    objectParams?: string | null;
    loanAmount?: number | null;
    marketValue?: number | null;
    creditorIncome?: number | null;
    legalEntity?: string | null;
    term?: string | null;
    rate?: string | null;
    dealType?: string | null;
    contactUrl?: string | null;
};