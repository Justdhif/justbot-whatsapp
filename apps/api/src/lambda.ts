import 'reflect-metadata';
import * as dotenv from 'dotenv';
dotenv.config();

import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { RequestMethod } from '@nestjs/common';
import serverless from 'serverless-http';
import helmet from 'helmet';
import { AppModule } from './app.module';




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

  
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );

  
  app.enableCors({
    origin: corsOrigins,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Authorization', 'Content-Type', 'Accept'],
    credentials: true,
  });

  
  app.setGlobalPrefix('api', {
    exclude: [{ path: '/', method: RequestMethod.GET }],
  });

  
  await app.init();

  
  const expressApp = app.getHttpAdapter().getInstance();
  return serverless(expressApp);
}


export const handler = async (
  event: Record<string, unknown>,
  context: Record<string, unknown>,
): Promise<unknown> => {
  
  if (!cachedHandler) {
    cachedHandler = await bootstrapServer();
  }
  return cachedHandler(event, context);
};
