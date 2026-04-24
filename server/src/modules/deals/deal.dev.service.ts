import {Op, WhereOptions} from "sequelize";
import {Deal} from "../../db/models/Deal";
import {Source} from "../../db/models/Source";
import {RawMessage} from "./deal.types";
import {buildDealDataFromRaw} from "./deal.builder";
import {calculateTopDealScore, getIsTopDeal} from "./deal.scoring";

type ReparseDealsParams = {
    sourceId?: number;
    dealId?: number;
    limit?: number;
    dryRun?: boolean;
};

export async function reparseDealsFromSavedText(params: ReparseDealsParams = {}) {
    const where: WhereOptions = {
        fullText: {
            [Op.ne]: null,
        },
    };

    if (params.sourceId) {
        where.sourceId = params.sourceId;
    }

    if (params.dealId) {
        where.id = params.dealId;
    }

    const deals = await Deal.findAll({
        where,
        include: [
            {
                model: Source,
                as: 'source',
                required: true,
            },
        ],
        order: [['id', 'ASC']],
        limit: params.limit ?? undefined,
    });

    let updated = 0;
    let skipped = 0;
    let failed = 0;

    const errors: Array<{ dealId: number; message: string }> = [];

    for (const deal of deals) {
        try {
            const source = (deal as any).source as Source | undefined;

            if (!source) {
                skipped++;
                errors.push({
                    dealId: deal.id,
                    message: 'Source not found on deal',
                });
                continue;
            }

            const fullText = deal.fullText?.trim();

            if (!fullText) {
                skipped++;
                continue;
            }

            const raw: RawMessage = {
                sourceType: 'telegram',
                sourceId: deal.sourceId,

                sourceChannelId: source.externalId ?? null,
                sourceTitle: source.title ?? source.name ?? null,

                externalMessageId: deal.externalMessageId,
                publishedAt: deal.publishedAt
                    ? deal.publishedAt.toISOString()
                    : null,

                text: fullText,
                url: deal.postUrl ?? null,

                images: [],

                metadata: {
                    reparse: true,
                    originalDealId: deal.id,
                },
            };

            const built = await buildDealDataFromRaw(raw, source, deal.images ?? []);

            if (built.skipped) {
                skipped++;
                errors.push({
                    dealId: deal.id,
                    message: built.message ?? 'Parser skipped deal',
                });
                continue;
            }

            if (!params.dryRun) {
                await deal.update(built.dealData);
            }

            updated++;
        } catch (e) {
            failed++;

            errors.push({
                dealId: deal.id,
                message: e instanceof Error ? e.message : String(e),
            });
        }
    }

    return {
        ok: true,
        dryRun: params.dryRun ?? false,
        total: deals.length,
        updated,
        skipped,
        failed,
        errors,
    };
}


type RecalculateScoresParams = {
    sourceId?: number;
    dealId?: number;
    limit?: number;
    dryRun?: boolean;
};

export async function recalculateDealScores(params: RecalculateScoresParams = {}) {
    const where: WhereOptions = {};

    if (params.sourceId) {
        where.sourceId = params.sourceId;
    }

    if (params.dealId) {
        where.id = params.dealId;
    }

    const deals = await Deal.findAll({
        where,
        order: [['id', 'ASC']],
        limit: params.limit ?? undefined,
    });

    let updated = 0;
    let failed = 0;

    const errors: Array<{ dealId: number; message: string }> = [];

    for (const deal of deals) {
        try {
            const topDealScore = calculateTopDealScore({
                ltv: deal.ltv,
                interestRateMonthly: deal.interestRateMonthly,
                monthlyIncome: deal.monthlyIncome,
                loanAmount: deal.loanAmount,
                loanTermMonths: deal.loanTermMonths,
            });

            const isTopDeal = getIsTopDeal(topDealScore);

            if (!params.dryRun) {
                await deal.update({
                    topDealScore,
                    isTopDeal: false,
                });
            }

            updated++;
        } catch (e) {
            failed++;

            errors.push({
                dealId: deal.id,
                message: e instanceof Error ? e.message : String(e),
            });
        }
    }

    return {
        ok: true,
        dryRun: params.dryRun ?? false,
        total: deals.length,
        updated,
        failed,
        errors,
    };
}

