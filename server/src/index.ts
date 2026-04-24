import { createApp } from './app/createApp.js';
import { env } from './config/env.js';
import { sequelize } from './db/sequelize.js';
import { initModels } from './db/initModels.js';
import './db/models';

async function bootstrap() {
    initModels();

    await sequelize.authenticate();
    console.log('✅ Database connected');

    await sequelize.sync({ alter: true });
    console.log('✅ Models synchronized');

    const app = createApp();

    app.listen(env.port, () => {
        console.log(`🚀 API started on http://localhost:${env.port}`);
    });
}

bootstrap().catch((error) => {
    console.error('❌ Bootstrap error:', error);
    process.exit(1);
});