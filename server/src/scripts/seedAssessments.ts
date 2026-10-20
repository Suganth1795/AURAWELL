import { ASSESSMENT_SEEDS } from '../data/assessments.js';
import { connectDatabase, disconnectDatabase } from '../config/database.js';
import { env } from '../config/env.js';
import { Assessment } from '../models/index.js';
import { logger } from '../utils/logger.js';

/**
 * Upserts the assessment catalogue into MongoDB.
 * Safe to run repeatedly (idempotent by `code`).
 */
async function seedAssessments(): Promise<void> {
  await connectDatabase(env.MONGODB_URI);

  let upserted = 0;
  for (const seed of ASSESSMENT_SEEDS) {
    await Assessment.updateOne({ code: seed.code }, { $set: { ...seed } }, { upsert: true });
    upserted += 1;
  }

  const total = await Assessment.countDocuments();
  logger.info({ upserted, total }, 'Assessment catalogue seeded');
}

seedAssessments()
  .then(() => disconnectDatabase())
  .then(() => process.exit(0))
  .catch((error) => {
    logger.error({ err: error }, 'Assessment seeding failed');
    process.exitCode = 1;
    return disconnectDatabase().finally(() => process.exit(1));
  });
