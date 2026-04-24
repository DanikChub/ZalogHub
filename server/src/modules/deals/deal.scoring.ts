export function calculateTopDealScore(input: {
    ltv?: number | null;
    interestRateMonthly: number | null;
    monthlyIncome?: number | null;
    loanAmount: number | null;
    loanTermMonths?: number | null;
}) {
    const { ltv, loanTermMonths } = input;

    let score = 0;

    // Без LTV вообще нельзя быть топом
    if (ltv === null) {
        return 0;
    }

    // =========================
    // 1. LTV — главный фактор
    // =========================
    if (ltv <= 35) score += 80;
    else if (ltv <= 40) score += 70;
    else if (ltv <= 45) score += 60;
    else if (ltv <= 50) score += 45;
    else if (ltv <= 55) score += 30;
    else if (ltv <= 60) score += 15;
    else if (ltv <= 65) score += 5;
    else if (ltv <= 70) score -= 10;
    else if (ltv <= 75) score -= 30;
    else if (ltv <= 80) score -= 60;
    else score -= 100;

    // =========================
    // 2. Срок — второй фактор
    // =========================
    if (loanTermMonths !== null && loanTermMonths !== undefined) {
        if (loanTermMonths >= 60) score += 20;
        else if (loanTermMonths >= 48) score += 15;
        else if (loanTermMonths >= 36) score += 10;
        else if (loanTermMonths >= 24) score += 5;
        else if (loanTermMonths >= 12) score += 0;
        else if (loanTermMonths >= 6) score -= 5;
        else score -= 15;
    } else {
        // срок неизвестен = небольшой штраф
        score -= 5;
    }

    // Ограничиваем диапазон
    if (score < 0) score = 0;
    if (score > 100) score = 100;

    return score;
}

export function getIsTopDeal(score: number | null) {
    if (score === null) return false;

    // ТОП только для реально сильных заявок
    return score >= 75;
}