import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const envSchema = z.object({
  PORT: z.string().default('3000').transform((val) => parseInt(val, 10)),
  HOST: z.string().default('0.0.0.0'),
  GROQ_API_KEY: z.string().min(1, 'GROQ_API_KEY is required'),
  WA_VERIFY_TOKEN: z.string().min(1, 'WA_VERIFY_TOKEN is required'),
  WA_PHONE_NUMBER_ID: z.string().min(1, 'WA_PHONE_NUMBER_ID is required'),
  WA_CLOUD_API_ACCESS_TOKEN: z.string().min(1, 'WA_CLOUD_API_ACCESS_TOKEN is required'),

  BOT_OPERATIONAL_START: z.string().default('07:00'),
  BOT_OPERATIONAL_END: z.string().default('21:00'),
  
  BOT_OPERATIONAL_DAYS: z.string().default('1,2,3,4,6,7'),
  BOT_ENABLE_SCHEDULE: z.string().default('true').transform((val) => val.toLowerCase() === 'true'),

  BACKEND_API_URL: z.string().default('http://localhost:3001'),
  BOT_SECRET: z.string().default('justbot_super_secure_bot_secret_key_12345'),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error('❌ Invalid environment variables:', _env.error.format());
  process.exit(1);
}

export const env = _env.data;

let botBaseUrl = "";
export function getBotBaseUrl(): string {
  return botBaseUrl;
}
export function setBotBaseUrl(url: string) {
  botBaseUrl = url;
}
