import type {DealFilters} from "@/features/deal-filters/models/types.ts";

export type DealImage = {
    filename: string;
    path?: string | null;
    url?: string | null;
    mimeType?: string | null;
};

export type BorrowerType =
    | 'individual'
    | 'self_employed'
    | 'sole_proprietor'
    | 'company';

export type InterestRateSource =
    | 'provided'
    | 'parsed'
    | 'estimated';

export type DealCity = {
    id: number;
    name: string;
};

export type DealSource = {
    id: number;
    name: string;
    key: string;
    type: string;
    externalId: string | null;
    title: string | null;
    url: string | null;
};

export type Deal = {
    id: number;

    // SOURCE (НОВОЕ!)
    sourceId: number;
    source?: DealSource | null;

    externalMessageId: string;
    publishedAt: string | null;

    // CONTENT
    objectName: string | null;
    type: string | null;
    address: string | null;
    objectParams: string | null;
    fullText: string | null;

    // CITY
    city: DealCity | null;
    cityId: number | null;
    parsedCityRaw: string | null;

    // FINANCE
    loanAmount: number | null;
    collateralValue: number | null;

    interestRateMonthly: number | null;
    interestRateMonthlySource: InterestRateSource | null;

    loanTermMonths: number | null;

    borrowerType: BorrowerType | null;

    // COMPUTED
    ltv: number | null;
    monthlyIncome: number | null;
    totalIncome: number | null;

    // BEST
    isTopDeal: boolean;
    topDealScore: number | null;

    // CONTACT
    contactUrl: string | null;
    postUrl: string | null;

    // MEDIA
    images: DealImage[] | null;

    createdAt: string;
    updatedAt: string;
};

export type DealListItem = Omit<Deal, 'fullText'> & {
    fullText?: never;
};

export type DealDetails = Deal;

export type DealsQueryParams = DealFilters & {
    page?: number;
    limit?: number;
};

export type DealResponse = {
    ok: boolean;

    items: DealListItem[];

    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
};