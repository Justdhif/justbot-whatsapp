import 'reflect-metadata';
import * as dotenv from 'dotenv';
dotenv.config();

import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { RequestMethod } from '@nestjs/common';
import serverless from 'serverless-http';
import helmet from 'helmet';
import { AppModule } from './app.module';

/**
 * Lambda / Serverless Handler untuk Netlify Functions
 *
 * Strategi: App instance di-cache di module scope.
 * - Cold start  : Lambda container baru → NestJS init (~1-3 detik)
 * - Warm start  : Container masih hidup → reuse cached handler (~50-200ms)
 *
 * Dengan pola ini, NestJS hanya di-bootstrap SEKALI per Lambda container,
 * bukan per request. Ini sangat penting untuk performa di serverless.
 */

// Cache handler di module scope (bertahan selama Lambda container hidup)
let cachedHandler: ReturnType<typeof serverless> | null = null;

async function bootstrapServer() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  const config = app.get(ConfigService);
  const rawOrigins = config.get<string>('CORS_ORIGINS', '*');
  const corsOrigins = rawOrigins === '*'
    ? true
    : rawOrigins.split(',').map((o: string) => o.trim());

  // Security headers
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );

  // CORS
  app.enableCors({
    origin: corsOrigins,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Authorization', 'Content-Type', 'Accept'],
    credentials: true,
  });

  // Global API prefix — kecuali "/" agar root route accessible di production
  app.setGlobalPrefix('api', {
    exclude: [{ path: '/', method: RequestMethod.GET }],
  });

  // Init tanpa listen (serverless tidak perlu port)
  await app.init();

  // Ambil Express instance yang sudah di-configure NestJS
  const expressApp = app.getHttpAdapter().getInstance();
  return serverless(expressApp);
}

/**
 * Handler yang di-export untuk Netlify Function.
 * Kompatibel dengan AWS Lambda event/context format.
 */
export const handler = async (
  event: Record<string, unknown>,
  context: Record<string, unknown>,
): Promise<unknown> => {
  // Lazy-initialize dan cache server
  if (!cachedHandler) {
    cachedHandler = await bootstrapServer();
  }
  return cachedHandler(event, context);
};
