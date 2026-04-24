import dotenv from 'dotenv';

dotenv.config();

export const env = {
    port: Number(process.env.PORT || 5000),
    clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
    parserToken: process.env.PARSER_TOKEN || '',

    db: {
        host: process.env.DB_HOST || 'localhost',
        port: Number(process.env.DB_PORT || 5432),
        name: process.env.DB_NAME || 'zaloghub',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
        logging: process.env.DB_LOGGING === 'true',
    },
    devApiKey: process.env.DEV_API_KEY || '',
};