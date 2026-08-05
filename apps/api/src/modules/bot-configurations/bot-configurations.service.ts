import { Injectable, NotFoundException } from '@nestjs/common';
import { BotConfigurationsRepository } from './bot-configurations.repository';
import { UpdateBotConfigurationDto } from './dto/update-bot-configuration.dto';
import { BotConfiguration } from '../../database/schema';

@Injectable()
export class BotConfigurationsService {
  constructor(
    private readonly botConfigurationsRepository: BotConfigurationsRepository,
  ) {}

  /**
   * Mengambil konfigurasi aktif (auto-initialize jika kosong).
   */
  async getConfiguration(): Promise<BotConfiguration> {
    let config = await this.botConfigurationsRepository.findFirst();
    if (!config) {
      config = await this.botConfigurationsRepository.createDefault();
    }
    return config;
  }

  /**
   * Mengubah konfigurasi bot operasional (hanya untuk admin / super_admin).
   */
  async updateConfiguration(
    adminId: string,
    dto: UpdateBotConfigurationDto,
  ): Promise<BotConfiguration> {
    const config = await this.getConfiguration();

    return this.botConfigurationsRepository.update(config.id, {
      ...dto,
      updatedBy: adminId,
    });
  }
}
