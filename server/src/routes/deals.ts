import { Router } from 'express';
import {
    getDealByIdController,
    getDealsController,
} from '../modules/deals/deal.controller.js';

const dealsRouter = Router();

dealsRouter.get('/', async (req, res, next) => {
    try {
        return await getDealsController(req, res);
    } catch (error) {
        next(error);
    }
});

dealsRouter.get('/:id', async (req, res, next) => {
    try {
        return await getDealByIdController(req, res);
    } catch (error) {
        next(error);
    }
});


export { dealsRouter };