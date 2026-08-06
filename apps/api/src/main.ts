import 'reflect-metadata';
import * as dotenv from 'dotenv';
dotenv.config();
import { NestFactory, Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { RequestMethod } from '@nestjs/common';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug'],
  });

  const config = app.get(ConfigService);
  const port = config.get<number>('PORT', 3001);
  const rawOrigins = config.get<string>('CORS_ORIGINS', 'http://localhost:3000');
  const corsOrigins = rawOrigins === '*'
    ? true
    : rawOrigins.split(',').map((o) => o.trim());

  
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

  
  app.enableShutdownHooks();

  await app.listen(port);

  console.log(`\n🚀 JustBot API running on: http://localhost:${port}/api`);
  console.log(`📊 Environment: ${config.get('NODE_ENV')}\n`);
}

bootstrap().catch((err) => {
  console.error('❌ Failed to start application:', err);
  process.exit(1);
});
