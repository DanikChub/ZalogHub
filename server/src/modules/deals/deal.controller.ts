import fs from 'node:fs/promises';
import path from 'node:path';
import {NextFunction, Request, Response} from 'express';
import { v4 as uuidv4 } from 'uuid';
import {
    createOrUpdateDealFromParser,
    getDealById,
    getDeals,
} from './deal.service.js';
import type {
    RawMessage,
    UploadedDealImage,
} from './deal.types.js';
import {Deal} from "../../db/models/Deal";
import {WhereOptions} from "sequelize";
import {calculateTopDealScore} from "./deal.scoring";

async function ensureDir(dirPath: string) {
    await fs.mkdir(dirPath, { recursive: true });
}

async function persistUploadedImages(
    files: Express.Multer.File[] = [],
): Promise<UploadedDealImage[]> {
    if (!files.length) return [];

    const targetDir = path.resolve(process.cwd(), 'storage', 'deals');
    await ensureDir(targetDir);

    const result: UploadedDealImage[] = [];

    for (const file of files) {
        const ext = path.extname(file.originalname || '') || '.jpg';
        const filename = `${uuidv4()}${ext}`;
        const finalPath = path.join(targetDir, filename);

        await fs.rename(file.path, finalPath);

        result.push({
            filename,
            mimeType: file.mimetype || null,
            path: finalPath,
            url: `/static/deals/${filename}`,
        });
    }

    return result;
}

function parseJsonField<T>(value: unknown, fallback: T): T {
    if (typeof value !== 'string') return fallback;

    try {
        return JSON.parse(value) as T;
    } catch {
        return fallback;
    }
}

export async function createDealFromParserController(
    req: Request,
    res: Response,
) {
    const raw = parseJsonField<RawMessage | null>(req.body.raw, null);

    if (!raw) {
        return res.status(400).json({
            ok: false,
            message: 'Invalid raw payload',
        });
    }

    const images = await persistUploadedImages(req.files as Express.Multer.File[]);

    const result = await createOrUpdateDealFromParser(raw, images);

    return res.status(result.status).json({
        ok: result.ok,
        created: result.created ?? false,
        skipped: result.skipped ?? false,
        id: result.deal?.id ?? null,
        message: result.message ?? null,
    });
}


function toNumber(value: unknown): number | undefined {
    if (typeof value !== 'string' || !value.trim()) return undefined;

    const num = Number(value);
    return Number.isFinite(num) ? num : undefined;
}

function parseNumberArray(value: unknown): number[] | undefined {
    if (typeof value !== 'string') return undefined;

    const items = value
        .split(',')
        .map((item) => Number(item.trim()))
        .filter((num) => Number.isInteger(num) && num > 0);

    return items.length ? items : undefined;
}

export async function getDealsController(req: Request, res: Response) {
    const result = await getDeals({
        page: toNumber(req.query.page) ?? 1,
        limit: toNumber(req.query.limit) ?? 20,
        search: typeof req.query.search === 'string' ? req.query.search : undefined,

        cityIds: parseNumberArray(req.query.cityIds),
        sourceId: toNumber(req.query.sourceId),

        borrowerType:
            typeof req.query.borrowerType === 'string'
                ? (req.query.borrowerType as
                    | 'individual'
                    | 'self_employed'
                    | 'sole_proprietor'
                    | 'company')
                : undefined,

        minLoanAmount: toNumber(req.query.minLoanAmount),
        maxLoanAmount: toNumber(req.query.maxLoanAmount),

        minCollateralValue: toNumber(req.query.minCollateralValue),
        maxCollateralValue: toNumber(req.query.maxCollateralValue),

        minMonthlyIncome: toNumber(req.query.minMonthlyIncome),
        maxMonthlyIncome: toNumber(req.query.maxMonthlyIncome),

        minInterestRateMonthly: toNumber(req.query.minInterestRateMonthly),
        maxInterestRateMonthly: toNumber(req.query.maxInterestRateMonthly),

        minLtv: toNumber(req.query.minLtv),
        maxLtv: toNumber(req.query.maxLtv),

        minLoanTermMonths: toNumber(req.query.minLoanTermMonths),
        maxLoanTermMonths: toNumber(req.query.maxLoanTermMonths),

        sortBy:
            typeof req.query.sortBy === 'string'
                ? (req.query.sortBy as
                    | 'publishedAt'
                    | 'loanAmount'
                    | 'collateralValue'
                    | 'monthlyIncome'
                    | 'interestRateMonthly'
                    | 'ltv')
                : undefined,

        sortOrder:
            req.query.sortOrder === 'ASC' || req.query.sortOrder === 'DESC'
                ? req.query.sortOrder
                : undefined,
    });

    return res.json(result);
}

export async function getDealByIdController(req: Request, res: Response) {
    const id = Number(req.params.id);

    if (!Number.isFinite(id)) {
        return res.status(400).json({
            ok: false,
            message: 'Invalid id',
        });
    }

    const deal = await getDealById(id);

    if (!deal) {
        return res.status(404).json({
            ok: false,
            message: 'Deal not found',
        });
    }

    return res.json({
        ok: true,
        item: deal,
    });
}

