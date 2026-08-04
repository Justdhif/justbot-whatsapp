import { Module } from '@nestjs/common';
import { RemindersController } from './reminders.controller';
import { RemindersService } from './reminders.service';
import { RemindersRepository } from './reminders.repository';

@Module({
  controllers: [RemindersController],
  providers: [RemindersService, RemindersRepository],
  /**
   * RemindersRepository di-export agar bisa digunakan oleh bot-service
   * untuk polling reminder yang pending (findPendingReminders, markAsSent).
   */
  exports: [RemindersRepository],
})
export class RemindersModule {}
