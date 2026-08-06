import * as Joi from 'joi';


export const envValidationSchema = Joi.object({
  
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.number().default(3001),
  APP_NAME: Joi.string().default('justbot-api'),

  
  DATABASE_URL: Joi.string().uri().required(),

  
  JWT_ACCESS_SECRET: Joi.string().min(32).required(),
  JWT_ACCESS_EXPIRES_IN: Joi.string().default('15m'),
  JWT_REFRESH_SECRET: Joi.string().min(32).required(),
  JWT_REFRESH_EXPIRES_IN: Joi.string().default('30d'),

  
  CORS_ORIGINS: Joi.string().default('http://localhost:3000'),

  
  THROTTLE_TTL: Joi.number().default(900000),
  THROTTLE_LIMIT: Joi.number().default(100),

  
  WA_BOT_NUMBER: Joi.string().default('6282213111575'),
  BOT_SECRET: Joi.string().default('justbot_super_secure_bot_secret_key_12345'),
  BOT_SERVICE_URL: Joi.string().uri().default('https://justbot-service.netlify.app'),
});
