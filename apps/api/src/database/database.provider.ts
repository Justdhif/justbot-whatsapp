import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { ConfigService } from '@nestjs/config';
import * as schema from './schema';

export const DATABASE_CONNECTION = 'DATABASE_CONNECTION';

/**
 * Drizzle + Neon provider untuk NestJS DI.
 *
 * Menggunakan `neon-http` driver yang dirancang untuk serverless/edge functions.
 * Koneksi dibuat sekali dan di-reuse melalui connection pool Neon (PgBouncer).
 */
export const databaseProvider = {
  provide: DATABASE_CONNECTION,
  useFactory: (configService: ConfigService) => {
    const databaseUrl = configService.getOrThrow<string>('DATABASE_URL');
    const sql = neon(databaseUrl);
    return drizzle(sql, { schema });
  },
  inject: [ConfigService],
};
