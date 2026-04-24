import type { Request, Response } from 'express';
import {
    getCitiesService,
    getCityByIdService,
    searchCitiesService,
} from './city.service.js';

export async function getCitiesController(req: Request, res: Response) {
    const cities = await getCitiesService({
        limit: req.query.limit ? Number(req.query.limit) : undefined,
        offset: req.query.offset ? Number(req.query.offset) : undefined,
    });

    return res.json(cities);
}

export async function searchCitiesController(req: Request, res: Response) {
    const q = typeof req.query.q === 'string' ? req.query.q : '';

    const cities = await searchCitiesService({
        q,
        limit: req.query.limit ? Number(req.query.limit) : undefined,
    });

    return res.json(cities);
}

export async function getCityByIdController(req: Request, res: Response) {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({
            message: 'Некорректный id города',
        });
    }

    const city = await getCityByIdService(id);

    if (!city) {
        return res.status(404).json({
            message: 'Город не найден',
        });
    }

    return res.json(city);
}