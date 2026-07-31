import pino from 'pino';

// In production/serverless environment (Vercel/Netlify), use standard JSON Pino logger
// pino-pretty transport causes worker thread crash in AWS Lambda/Netlify Functions
const isProduction = process.env.NODE_ENV === 'production' || process.env.NETLIFY || process.env.VERCEL;

export const logger = pino(
  isProduction
    ? { level: 'info' }
    : {
        level: process.env.LOG_LEVEL || 'info',
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:yyyy-mm-dd HH:MM:ss',
            ignore: 'pid,hostname',
          },
        },
      }
);
