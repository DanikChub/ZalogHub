import { startParser } from './telegram/startParser.js';

startParser().catch((error) => {
    console.error('parser start failed', error);
    process.exit(1);
});