import {ParsedDealFields} from "./deal.types";

export function finalizeParsedFields(parsed: ParsedDealFields): ParsedDealFields {
    const interestRateMonthly =
        parsed.interestRateMonthly !== null &&
        parsed.interestRateMonthly !== undefined
            ? parsed.interestRateMonthly
            : 4;

    const interestRateMonthlySource =
        parsed.interestRateMonthly !== null &&
        parsed.interestRateMonthly !== undefined
            ? parsed.interestRateMonthlySource ?? 'parsed'
            : 'estimated';

    const ltv =
        parsed.loanAmount !== null &&
        parsed.loanAmount !== undefined &&
        parsed.collateralValue !== null &&
        parsed.collateralValue !== undefined &&
        parsed.collateralValue > 0
            ? Number(((parsed.loanAmount / parsed.collateralValue) * 100).toFixed(2))
            : parsed.ltv ?? null;

    const monthlyIncome =
        parsed.loanAmount !== null &&
        parsed.loanAmount !== undefined &&
        interestRateMonthly !== null
            ? Math.round(parsed.loanAmount * (interestRateMonthly / 100))
            : parsed.monthlyIncome ?? null;

    const totalIncome =
        monthlyIncome !== null &&
        parsed.loanTermMonths !== null &&
        parsed.loanTermMonths !== undefined
            ? monthlyIncome * parsed.loanTermMonths
            : parsed.totalIncome ?? null;

    return {
        ...parsed,
        interestRateMonthly,
        interestRateMonthlySource,
        ltv,
        monthlyIncome,
        totalIncome,
    };
}