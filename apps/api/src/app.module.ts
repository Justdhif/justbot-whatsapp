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
import { BotConfigurationsModule } from './modules/bot-configurations/bot-configurations.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';

@Module({
  imports: [
    
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: envValidationSchema,
      load: [appConfig, jwtConfig],
      cache: true,
    }),

    
    ThrottlerModule.forRoot([
      {
        ttl: parseInt(process.env.THROTTLE_TTL ?? '900000', 10),
        limit: parseInt(process.env.THROTTLE_LIMIT ?? '100', 10),
      },
    ]),

    
    DatabaseModule,

    
    AuthModule,
    UsersModule,
    FinanceModule,
    RemindersModule,
    BotConfigurationsModule,
    AnalyticsModule,
  ],
  controllers: [AppController],
  providers: [
    
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
    
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        whitelist: true,         
        forbidNonWhitelisted: true, 
        transform: true,         
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    },
  ],
})
export class AppModule {}
