// middlewares/devAuthMiddleware.ts
import { NextFunction, Request, Response } from 'express';
import {env} from "../config/env";

export function devAuthMiddleware(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    const expectedKey = env.devApiKey;
    const providedKey = req.headers['x-dev-key'];

    if (!expectedKey) {
        return res.status(500).json({
            ok: false,
            message: 'DEV_API_KEY is not configured',
        });
    }

    if (providedKey !== expectedKey) {
        return res.status(403).json({
            ok: false,
            message: 'Forbidden',
        });
    }

    next();
}