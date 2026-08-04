import { Module, Global } from '@nestjs/common';
import { databaseProvider } from './database.provider';

/**
 * DatabaseModule — Global module.
 * @Global() agar DATABASE_CONNECTION token tersedia di seluruh aplikasi
 * tanpa perlu import DatabaseModule di setiap module.
 */
@Global()
@Module({
  providers: [databaseProvider],
  exports: [databaseProvider],
})
export class DatabaseModule {}
