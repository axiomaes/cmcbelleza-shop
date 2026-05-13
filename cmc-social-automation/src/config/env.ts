import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default('3000'),
  DATABASE_URL: z.string().url('DATABASE_URL must be a valid PostgreSQL connection string'),
  INSTAGRAM_BUSINESS_ID: z.string().min(1, 'INSTAGRAM_BUSINESS_ID is required'),
  INSTAGRAM_ACCESS_TOKEN: z.string().min(1, 'INSTAGRAM_ACCESS_TOKEN is required'),
  WEBHOOK_SECRET: z.string().min(1, 'WEBHOOK_SECRET is required to secure the endpoint'),
  META_APP_ID: z.string().min(1, 'META_APP_ID is required'),
  META_APP_SECRET: z.string().min(1, 'META_APP_SECRET is required'),
  META_PAGE_ID: z.string().min(1, 'META_PAGE_ID is required'),
  META_INITIAL_TOKEN: z.string().min(1, 'META_INITIAL_TOKEN is required'),
  META_TOKEN_REFRESH_API_KEY: z.string().min(1, 'META_TOKEN_REFRESH_API_KEY is required')
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
