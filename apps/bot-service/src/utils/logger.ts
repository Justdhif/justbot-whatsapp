import pino from 'pino';

// Clean standard JSON logger without pino-pretty transport dependency to avoid serverless build crashes
export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
});
