import express from 'express';
import cors from 'cors';
import path from 'node:path';
import { env } from '../config/env.js';
import { router } from '../routes/index.js';

export function createApp() {
    const app = express();

    app.use(
        cors({
            origin: env.clientUrl,
            credentials: true,
        }),
    );

    app.use(express.json({ limit: '2mb' }));

    app.use(
        '/static',
        express.static(path.resolve(process.cwd(), 'storage')),
    );

    app.use('/api', router);

    app.use(
        (
            error: unknown,
            _req: express.Request,
            res: express.Response,
            _next: express.NextFunction,
        ) => {
            console.error(error);

            return res.status(500).json({
                ok: false,
                message: 'Internal server error',
            });
        },
    );

    return app;
}