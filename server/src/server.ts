import { createApp } from './app.js';
import { env } from './config/env.js';
import { logger } from './utils/logger.js';
import { connectDatabase } from './config/database.js';
import { Assessment } from './models/index.js';
import { ASSESSMENT_SEEDS } from './data/assessments.js';

async function autoSeedAssessments() {
  try {
    const existingCount = await Assessment.countDocuments();
    if (existingCount < ASSESSMENT_SEEDS.length) {
      logger.info({ existingCount, targetCount: ASSESSMENT_SEEDS.length }, 'Syncing assessment seeds');
      for (const seed of ASSESSMENT_SEEDS) {
        await Assessment.updateOne(
          { code: seed.code },
          { $set: { ...seed } },
          { upsert: true }
        );
      }
      logger.info('Assessment seeds synced successfully');
    }
  } catch (err) {
    logger.warn({ err }, 'Could not auto-sync assessment seeds on startup');
  }
}

async function main() {
  await connectDatabase();
  await autoSeedAssessments();
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
