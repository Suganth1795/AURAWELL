import { createApp } from './app.js';
import { env } from './config/env.js';
import { logger } from './utils/logger.js';
import { connectDatabase } from './config/database.js';

async function main() {
  await connectDatabase();
  const app = createApp();
  const server = app.listen(env.PORT, () => {
    logger.info({ port: env.PORT }, 'AuraWell AI server listening');
  });

  const shutdown = (signal: string) => {
    logger.info({ signal }, 'Shutting down');
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(1), 10000).unref();
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

main().catch((error) => {
  logger.error({ err: error }, 'Failed to start server');
  process.exit(1);
});
