import { Router } from 'express';
import {
    getCitiesController,
    getCityByIdController,
    searchCitiesController,
} from '../modules/cities/city.controller.js';

const citiesRouter = Router();

citiesRouter.get('/', async (req, res, next) => {
    try {
        return await getCitiesController(req, res);
    } catch (error) {
        next(error);
    }
});

citiesRouter.get('/search', async (req, res, next) => {
    try {
        return await searchCitiesController(req, res);
    } catch (error) {
        next(error);
    }
});

citiesRouter.get('/:id', async (req, res, next) => {
    try {
        return await getCityByIdController(req, res);
    } catch (error) {
        next(error);
    }
});

export { citiesRouter };