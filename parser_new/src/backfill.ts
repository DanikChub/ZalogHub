import { TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions/index.js';
import { env } from './config/env.js';
import { backfillAllSources } from './telegram/backfillAllSources.js';
import { getSources } from './integrations/api/getSources.js';
import { backfillSource } from './telegram/backfillSources.js';

function getArg(name: string): string | null {
    const prefix = `--${name}=`;
    const arg = process.argv.find((item) => item.startsWith(prefix));
    return arg ? arg.slice(prefix.length) : null;
}

async function run() {
    const client = new TelegramClient(
        new StringSession(env.tgSession),
        Number(env.tgApiId),
        env.tgApiHash,
        { connectionRetries: 5 },
    );

    await client.start({
        phoneNumber: async () => '',
        password: async () => '',
        phoneCode: async () => '',
        onError: (err) => console.error(err),
    });

    const months = Number(getArg('months') ?? '2');
    const sourceIdArg = getArg('sourceId');
    const limit = Number(getArg('limit') ?? '50000');

    const fromDate = new Date();
    fromDate.setMonth(fromDate.getMonth() - months);

    console.log('🚀 starting backfill...');
    console.log({ months, sourceIdArg, limit, fromDate: fromDate.toISOString() });

    if (sourceIdArg) {
        const sourceId = Number(sourceIdArg);
        const sources = await getSources();
        const source = sources.find((item) => item.id === sourceId);

        if (!source) {
            throw new Error(`Source not found for sourceId=${sourceId}`);
        }

        await backfillSource({
            client,
            source,
            fromDate,
            limit,
            delayMs: 150,
        });
    } else {
        await backfillAllSources({
            client,
            fromDate,
            perSourceLimit: limit,
            delayMs: 150,
        });
    }

    console.log('✅ backfill finished');
    process.exit(0);
}

run().catch((e) => {
    console.error('backfill failed', e);
    process.exit(1);
});