import { Module, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';

import { envValidationSchema } from './config/env.validation';
import { appConfig, jwtConfig } from './config/app.config';

import { DatabaseModule } from './database/database.module';

import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';

import { AppController } from './app.controller';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { FinanceModule } from './modules/finance/finance.module';
import { RemindersModule } from './modules/reminders/reminders.module';

@Module({
  imports: [
    // ── Config (global) ───────────────────────────────────────────────────
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: envValidationSchema,
      load: [appConfig, jwtConfig],
      cache: true,
    }),

    // ── Rate Limiting ─────────────────────────────────────────────────────
    ThrottlerModule.forRoot([
      {
        ttl: parseInt(process.env.THROTTLE_TTL ?? '900000', 10),
        limit: parseInt(process.env.THROTTLE_LIMIT ?? '100', 10),
      },
    ]),

    // ── Database (Global) ─────────────────────────────────────────────────
    DatabaseModule,

    // ── Feature Modules ───────────────────────────────────────────────────
    AuthModule,
    UsersModule,
    FinanceModule,
    RemindersModule,
  ],
  controllers: [AppController],
  providers: [
    // Global JWT guard — semua route protected kecuali yang @Public()
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    // Global response format interceptor
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
    // Global exception filter
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    // Global validation pipe
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        whitelist: true,         // Hapus property yang tidak ada di DTO
        forbidNonWhitelisted: true, // Throw error jika ada property asing
        transform: true,         // Auto-transform payload ke class DTO
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    },
  ],
})
export class AppModule {}
