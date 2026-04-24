import { Request, Response } from 'express';
import { getParserSources } from './source.service.js';

export async function getParserSourcesController(_req: Request, res: Response) {
    const items = await getParserSources();

    return res.json({
        ok: true,
        items,
    });
}