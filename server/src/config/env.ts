import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  MONGODB_URI: z.string().min(1).default('mongodb://localhost:27017/aurawell'),
  SESSION_SECRET: z
    .string()
    .min(16, 'SESSION_SECRET must be at least 16 characters')
    .default('dev-only-insecure-session-secret-change-me'),
  CLIENT_ORIGIN: z.string().default('http://localhost:5173'),
  TRUST_PROXY: z.coerce.number().int().min(0).default(0),
  AI_PROVIDER: z.enum(['openai', 'anthropic', 'none']).default('openai'),
  AI_API_KEY: z.string().optional().default(''),
  AI_MODEL: z.string().default('gpt-4o-mini'),
  AI_BASE_URL: z.string().default('https://api.openai.com/v1'),
  AI_TIMEOUT_MS: z.coerce.number().int().positive().default(15000),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(15 * 60 * 1000),
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(300),
  AUTH_RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(15 * 60 * 1000),
  AUTH_RATE_LIMIT_MAX: z.coerce.number().int().positive().default(20),
});

export type AppEnv = z.infer<typeof envSchema>;

function loadEnv(): AppEnv {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
      .join('; ');
    throw new Error(`Invalid environment configuration: ${issues}`);
  }
  if (parsed.data.NODE_ENV === 'production' && parsed.data.SESSION_SECRET.length < 32) {
    throw new Error('SESSION_SECRET must be at least 32 characters in production');
  }
  return parsed.data;
}

export const env: AppEnv = loadEnv();

export const isProd = env.NODE_ENV === 'production';
export const isTest = env.NODE_ENV === 'test';
