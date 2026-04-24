import {NextFunction, Request, Response} from "express";
import {recalculateDealScores, reparseDealsFromSavedText} from "./deal.dev.service";


export async function reparseDeals(req: Request, res: Response, next: NextFunction) {
    try {
        const result = await reparseDealsFromSavedText({
            sourceId: req.body.sourceId ? Number(req.body.sourceId) : undefined,
            dealId: req.body.dealId ? Number(req.body.dealId) : undefined,
            limit: req.body.limit ? Number(req.body.limit) : undefined,
            dryRun: Boolean(req.body.dryRun),
        });

        return res.json(result);
    } catch (e) {
        next(e);
    }
}

export async function recalculateDealScoresController(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    try {
        const body = req.body ?? {};

        const result = await recalculateDealScores({
            sourceId: body.sourceId ? Number(body.sourceId) : undefined,
            dealId: body.dealId ? Number(body.dealId) : undefined,
            limit: body.limit ? Number(body.limit) : undefined,
            dryRun: Boolean(body.dryRun),
        });

        return res.json(result);
    } catch (e) {
        next(e);
    }
}