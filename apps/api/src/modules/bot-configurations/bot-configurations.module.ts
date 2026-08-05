import { Module } from '@nestjs/common';
import { BotConfigurationsController } from './bot-configurations.controller';
import { BotConfigurationsService } from './bot-configurations.service';
import { BotConfigurationsRepository } from './bot-configurations.repository';

@Module({
  controllers: [BotConfigurationsController],
  providers: [BotConfigurationsService, BotConfigurationsRepository],
  exports: [BotConfigurationsService],
})
export class BotConfigurationsModule {}
