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
  
  // CuanBuddy Backend API Base URL
  CUANBUDDY_API_BASE_URL: z.string().default('https://cuan-buddy-api.vercel.app'),

  // Bot Operational Hours (Format 24 Jam in WIB/UTC+7, e.g. 08:00 to 22:00)
  BOT_OPERATIONAL_START: z.string().default('08:00'),
  BOT_OPERATIONAL_END: z.string().default('22:00'),
  // Hari Aktif: 1=Mon, 2=Tue, 3=Wed, 4=Thu, 6=Sat, 7=Sun (Hari Jumat 5 OFF secara default)
  BOT_OPERATIONAL_DAYS: z.string().default('1,2,3,4,6,7'),
  BOT_ENABLE_SCHEDULE: z.string().default('true').transform((val) => val.toLowerCase() === 'true'),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error('❌ Invalid environment variables:', _env.error.format());
  process.exit(1);
}

export const env = _env.data;
