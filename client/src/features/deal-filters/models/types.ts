import type {BorrowerType} from "@/entities/deal/model/types.ts";
import type {City} from "@/entities/city";


export type DealFilters = {
    search?: string;

    cities?: City[];
    cityIds?: number[];

    sourceId?: number;

    borrowerType?: BorrowerType;

    minLoanAmount?: number;
    maxLoanAmount?: number;

    minCollateralValue?: number;
    maxCollateralValue?: number;

    minMonthlyIncome?: number;
    maxMonthlyIncome?: number;

    minInterestRateMonthly?: number;
    maxInterestRateMonthly?: number;

    minLtv?: number;
    maxLtv?: number;

    minLoanTermMonths?: number;
    maxLoanTermMonths?: number;

    sortBy?:
        | 'publishedAt'
        | 'loanAmount'
        | 'collateralValue'
        | 'monthlyIncome'
        | 'interestRateMonthly'
        | 'ltv'
        | 'topDealScore';

    sortOrder?: 'ASC' | 'DESC';
};