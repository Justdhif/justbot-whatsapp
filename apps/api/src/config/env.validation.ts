import Joi from 'joi';

/**
 * Schema validasi environment variables.
 * Aplikasi akan CRASH saat startup jika ada env yang kurang atau tidak valid.
 * Ini mencegah aplikasi berjalan dalam kondisi konfigurasi yang tidak lengkap.
 */
export const envValidationSchema = Joi.object({
  // Application
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.number().default(3001),
  APP_NAME: Joi.string().default('justbot-api'),

  // Database
  DATABASE_URL: Joi.string().uri().required(),

  // JWT
  JWT_ACCESS_SECRET: Joi.string().min(32).required(),
  JWT_ACCESS_EXPIRES_IN: Joi.string().default('15m'),
  JWT_REFRESH_SECRET: Joi.string().min(32).required(),
  JWT_REFRESH_EXPIRES_IN: Joi.string().default('30d'),

  // CORS
  CORS_ORIGINS: Joi.string().default('http://localhost:3000'),

  // Rate Limiting
  THROTTLE_TTL: Joi.number().default(900000),
  THROTTLE_LIMIT: Joi.number().default(100),
});
