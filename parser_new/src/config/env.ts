import dotenv from 'dotenv';

dotenv.config();

export const env = {
    tgApiId: Number(process.env.TG_API_ID || 0),
    tgApiHash: process.env.TG_API_HASH || '',
    tgSession: process.env.TG_SESSION || '',
    serverUrl: process.env.SERVER_URL || '',
    parserToken: process.env.PARSER_TOKEN || '',
};