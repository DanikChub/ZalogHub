import { client, initClient } from './transports/telegram/client.js';
import { registerTelegramHandlers } from './transports/telegram/handler.js';
import { backfillZalogDoveriya } from './transports/telegram/backfill-zalog-doveriya.js';

console.log('🚀 [main] parser booting...');

try {
    await initClient();
    console.log('✅ [main] telegram client initialized');

    const mode = process.env.PARSER_MODE ?? 'listen';

    if (mode === 'backfill-zalog-doveriya') {
        const fromDate = new Date();
        fromDate.setMonth(fromDate.getDay() - 3); // последние 2 месяца

        await backfillZalogDoveriya({
            client,
            fromDate,
            limit: 1000,
        });

        console.log('🏁 [main] backfill completed');
        process.exit(0);
    }

    // registerTelegramHandlers(client);
    console.log('✅ [main] telegram handlers registered');

    console.log('👂 [main] parser is listening for messages...');
} catch (error) {
    console.error('❌ [main] bootstrap error:', error);
    process.exit(1);
}