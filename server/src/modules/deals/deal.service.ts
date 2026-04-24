import { Op, Order, WhereOptions } from 'sequelize';
import {ContactUrlSource, Deal} from '../../db/models/Deal.js';
import { City } from '../../db/models/City.js';
import { Source } from '../../db/models/Source.js';
import { resolveDealCity } from './deal.city.js';
import { calculateTopDealScore, getIsTopDeal } from './deal.scoring.js';
import { ParsedDealFields, RawMessage, UploadedDealImage } from './deal.types.js';
import { resolveParserBySource } from '../parsers/parser.resolver.js';
import {buildDealDataFromRaw} from "./deal.builder";

async function getSourceOrThrow(sourceId: number) {
    const source = await Source.findByPk(sourceId);

    if (!source) {
        throw new Error(`Source not found: ${sourceId}`);
    }

    return source;
}

async function syncSourceMetadata(source: Source, raw: RawMessage) {
    const nextValues: Record<string, unknown> = {};
    let shouldUpdate = false;

    const nextTitle =
        typeof raw.sourceTitle === 'string' && raw.sourceTitle.trim()
            ? raw.sourceTitle.trim()
            : null;

    const nextChannelId =
        typeof raw.sourceChannelId === 'string' && raw.sourceChannelId.trim()
            ? raw.sourceChannelId.trim()
            : null;

    const nextChannelUrl =
        typeof raw.metadata?.channelUrl === 'string' && raw.metadata.channelUrl.trim()
            ? raw.metadata.channelUrl.trim()
            : null;

    if (nextTitle && source.title !== nextTitle) {
        nextValues.title = nextTitle;
        shouldUpdate = true;
    }

    if (nextChannelId && source.externalId !== nextChannelId) {
        nextValues.externalId = nextChannelId;
        shouldUpdate = true;
    }

    if (nextChannelUrl && source.url !== nextChannelUrl) {
        nextValues.url = nextChannelUrl;
        shouldUpdate = true;
    }

    if (shouldUpdate) {
        await source.update(nextValues);
    }
}




export async function createOrUpdateDealFromParser(
    raw: RawMessage,
    images: UploadedDealImage[] = [],
) {
    const source = await getSourceOrThrow(raw.sourceId);

    await syncSourceMetadata(source, raw);

    if (!source.isActive || !source.parseEnabled) {
        return {
            ok: true,
            skipped: true,
            status: 200,
            message: 'Source disabled',
        };
    }


    const built = await buildDealDataFromRaw(raw, source, images);

    if (built.skipped) {
        return {
            ok: built.ok,
            skipped: true,
            status: built.ok ? 200 : 422,
            message: built.message,
        };
    }

    const existing = await Deal.findOne({
        where: {
            sourceId: source.id,
            externalMessageId: raw.externalMessageId,
        },
    });



    if (existing) {
        await existing.update(built.dealData!);

        return {
            ok: true,
            created: false,
            skipped: false,
            status: 200,
            deal: existing,
        };
    }

    const deal = await Deal.create(built.dealData!);

    return {
        ok: true,
        created: true,
        skipped: false,
        status: 201,
        deal,
    };
}


type GetDealsParams = {
    page?: number;
    limit?: number;
    search?: string;

    cityIds?: number[];
    sourceId?: number;
    isTopDeal?: boolean;
    borrowerType?: 'individual' | 'self_employed' | 'sole_proprietor' | 'company';

    minLoanAmount?: number;
    maxLoanAmount?: number;

    minCollateralValue?: number;
    maxCollateralValue?: number;

    minMonthlyIncome?: number;
    maxMonthlyIncome?: number;

    minInterestRateMonthly?: number;
    maxInterestRateMonthly?: number;

    minLtv?: number;
    maxLtv?: number;

    minLoanTermMonths?: number;
    maxLoanTermMonths?: number;

    sortBy?:
        | 'publishedAt'
        | 'loanAmount'
        | 'collateralValue'
        | 'monthlyIncome'
        | 'interestRateMonthly'
        | 'ltv'
        | 'topDealScore';

    sortOrder?: 'ASC' | 'DESC';
};

function applyRangeFilter(
    where: WhereOptions,
    field: string,
    min?: number,
    max?: number,
) {
    if (min === undefined && max === undefined) return;

    const range: Record<symbol, number> = {} as Record<symbol, number>;

    if (min !== undefined) {
        range[Op.gte] = min;
    }

    if (max !== undefined) {
        range[Op.lte] = max;
    }

    (where as Record<string, unknown>)[field] = range;
}

export async function getDeals(params: GetDealsParams) {
    const page = params.page && params.page > 0 ? params.page : 1;
    const rawLimit = params.limit && params.limit > 0 ? params.limit : 20;
    const limit = Math.min(rawLimit, 30);
    const offset = (page - 1) * limit;

    const where: WhereOptions = {};

    const search = params.search?.trim();
    if (search) {
        (where as any)[Op.or] = [
            { type: { [Op.iLike]: `%${search}%` } },
            { address: { [Op.iLike]: `%${search}%` } },
            { objectName: { [Op.iLike]: `%${search}%` } },
            { objectParams: { [Op.iLike]: `%${search}%` } },
            { fullText: { [Op.iLike]: `%${search}%` } },
        ];
    }

    if (params.cityIds?.length) {
        where.cityId = { [Op.in]: params.cityIds };
    }

    if (params.sourceId) {
        where.sourceId = params.sourceId;
    }

    if (params.isTopDeal !== undefined) {
        where.isTopDeal = params.isTopDeal;
    }

    if (params.borrowerType) {
        where.borrowerType = params.borrowerType;
    }

    applyRangeFilter(where, 'loanAmount', params.minLoanAmount, params.maxLoanAmount);
    applyRangeFilter(where, 'collateralValue', params.minCollateralValue, params.maxCollateralValue);
    applyRangeFilter(where, 'monthlyIncome', params.minMonthlyIncome, params.maxMonthlyIncome);
    applyRangeFilter(where, 'interestRateMonthly', params.minInterestRateMonthly, params.maxInterestRateMonthly);
    applyRangeFilter(where, 'ltv', params.minLtv, params.maxLtv);
    applyRangeFilter(where, 'loanTermMonths', params.minLoanTermMonths, params.maxLoanTermMonths);

    const allowedSortFields: NonNullable<GetDealsParams['sortBy']>[] = [
        'publishedAt',
        'loanAmount',
        'collateralValue',
        'monthlyIncome',
        'interestRateMonthly',
        'ltv',
        'topDealScore',
    ];

    const sortBy = allowedSortFields.includes(params.sortBy as any)
        ? params.sortBy!
        : 'publishedAt';

    const sortOrder = params.sortOrder === 'ASC' ? 'ASC' : 'DESC';

    const order: Order = [
        [sortBy, sortOrder],
        ['id', 'DESC'],
    ];

    const { rows, count } = await Deal.findAndCountAll({
        where,
        attributes: [
            'id',
            'sourceId',
            'externalMessageId',
            'publishedAt',

            'objectName',
            'type',
            'address',
            'objectParams',

            'cityId',
            'parsedCityRaw',

            'loanAmount',
            'collateralValue',
            'interestRateMonthly',
            'interestRateMonthlySource',
            'loanTermMonths',
            'borrowerType',
            'images',

            'ltv',
            'monthlyIncome',
            'totalIncome',

            'isTopDeal',
            'topDealScore',

            'contactUrl',
            'postUrl',

            'createdAt',
            'updatedAt',
        ],
        include: [
            {
                model: City,
                as: 'city',
                attributes: ['id', 'name'],
                required: false,
            },
            {
                model: Source,
                as: 'source',
                attributes: ['id', 'name', 'type', 'key', 'title'],
                required: false,
            },
        ],
        order,
        limit,
        offset,
        distinct: true,
    });

    return {
        ok: true,
        items: rows,
        pagination: {
            page,
            limit,
            total: count,
            totalPages: Math.ceil(count / limit),
        },
    };
}

export async function getDealById(id: number) {
    return Deal.findByPk(id, {
        include: [
            {
                model: City,
                as: 'city',
                attributes: ['id', 'name'],
                required: false,
            },
            {
                model: Source,
                as: 'source',
                attributes: ['id', 'name', 'type', 'key', 'externalId', 'title', 'url'],
                required: false,
            },
        ],
    });
}




