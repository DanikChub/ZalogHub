import { Router } from 'express';

import {recalculateDealScoresController, reparseDeals} from "../modules/deals/deal.dev.controller";

const devRouter = Router();

devRouter.post('/deals/reparse', async (req, res, next) => {
    try {
        return await reparseDeals(req, res, next);
    } catch (error) {
        next(error);
    }
});

devRouter.post('/deals/recalculate-scores', async (req, res, next) => {
    try {
        return await recalculateDealScoresController(req, res, next);
    } catch (error) {
        next(error);
    }
});



export { devRouter };