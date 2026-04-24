import { Deal } from '../db/models/Deal.js';
import { calculateTopDealScore, getIsTopDeal } from '../modules/deals/deal.scoring.js';

async function run() {
    const deals = await Deal.findAll();

    console.log(`Found ${deals.length} deals to rescore`);

    let updated = 0;

    for (const deal of deals) {
        const topDealScore = calculateTopDealScore({
            ltv: deal.ltv,
            interestRateMonthly: deal.interestRateMonthly,
            monthlyIncome: deal.monthlyIncome,
            loanAmount: deal.loanAmount,
            loanTermMonths: deal.loanTermMonths,
        });

        const isTopDeal = getIsTopDeal(topDealScore);

        await deal.update({
            topDealScore,
            isTopDeal,
        });

        updated++;
    }

    console.log(`Rescored ${updated} deals`);
    process.exit(0);
}

run().catch((error) => {
    console.error('Rescore failed', error);
    process.exit(1);
});