import {RawMessage, UploadedDealImage} from "./deal.types";
import {Source} from "../../db/models/Source";
import {resolveParserBySource} from "../parsers/parser.resolver";
import {resolveDealCity} from "./deal.city";
import {calculateTopDealScore} from "./deal.scoring";
import {finalizeParsedFields} from "./deal.finalizer";

export async function buildDealDataFromRaw(raw: RawMessage, source: Source, images: UploadedDealImage[] = []) {
    const parser = resolveParserBySource(source);

    if (!parser) {
        return {
            ok: false as const,
            skipped: true,
            message: `Parser not found for source key: ${source.key}`,
        };
    }

    const parseResult = parser.parse(raw, source);

    if (!parseResult.shouldSave || !parseResult.parsed) {
        return {
            ok: true as const,
            skipped: true,
            message: parseResult.reason ?? 'Parser skipped message',
        };
    }

    const parsed = finalizeParsedFields(parseResult.parsed);

    const cityResult = await resolveDealCity({
        address: parsed.address,
        objectName: parsed.objectName,
        rawText: raw.text,
    });

    const topDealScore = calculateTopDealScore({
        ltv: parsed.ltv,
        interestRateMonthly: parsed.interestRateMonthly,
        monthlyIncome: parsed.monthlyIncome,
        loanAmount: parsed.loanAmount,
        loanTermMonths: parsed.loanTermMonths,
    });

    const contactUrl =
        parsed.contactUrl ??
        source.defaultContactUrl ??
        null;

    const contactUrlSource =
        parsed.contactUrl
            ? 'parsed'
            : source.defaultContactUrl
                    ? 'default'
                    : null;

    const dealData = {
        sourceId: source.id,
        externalMessageId: raw.externalMessageId,
        publishedAt: raw.publishedAt ? new Date(raw.publishedAt) : null,

        objectName: parsed.objectName,
        type: parsed.type,
        address: parsed.address,
        fullText: raw.text ?? null,

        cityId: cityResult.cityId,
        parsedCityRaw: cityResult.parsedCityRaw,

        loanAmount: parsed.loanAmount,
        collateralValue: parsed.collateralValue,
        interestRateMonthly: parsed.interestRateMonthly,
        interestRateMonthlySource: parsed.interestRateMonthlySource,
        loanTermMonths: parsed.loanTermMonths,
        borrowerType: parsed.borrowerType,

        ltv: parsed.ltv,
        monthlyIncome: parsed.monthlyIncome,
        totalIncome: parsed.totalIncome,

        objectParams: parsed.objectParams,

        // V0: лучше убрать топ
        isTopDeal: false,
        topDealScore,

        contactUrl: contactUrl,
        contactUrlSource: contactUrlSource,

        postUrl: raw.url ?? null,
        images,
    };

    return {
        ok: true as const,
        skipped: false,
        dealData,
    };
}
