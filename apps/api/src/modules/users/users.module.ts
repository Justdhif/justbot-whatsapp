import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UsersRepository } from './users.repository';

@Module({
  controllers: [UsersController],
  providers: [UsersService, UsersRepository],
  /**
   * UsersRepository di-export agar bisa digunakan oleh AuthModule
   * (untuk operasi auth seperti findByEmail, updateRefreshTokenHash, dll.)
   */
  exports: [UsersRepository],
})
export class UsersModule {}
