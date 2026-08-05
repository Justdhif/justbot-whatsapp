import { Body, Controller, Get, HttpCode, HttpStatus, Patch, UseGuards } from '@nestjs/common';
import { BotConfigurationsService } from './bot-configurations.service';
import { UpdateBotConfigurationDto } from './dto/update-bot-configuration.dto';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('bot-configurations')
export class BotConfigurationsController {
  constructor(
    private readonly botConfigurationsService: BotConfigurationsService,
  ) {}

  /**
   * GET /api/bot-configurations
   * Mengambil konfigurasi bot operasional aktif (Public).
   */
  @Public()
  @Get()
  async getConfiguration() {
    const config = await this.botConfigurationsService.getConfiguration();
    return {
      statusCode: HttpStatus.OK,
      message: 'Success retrieve bot configuration',
      data: config,
    };
  }

  /**
   * PATCH /api/bot-configurations
   * Memperbarui konfigurasi bot operasional (Hanya Admin / Super Admin).
   */
  @Patch()
  @UseGuards(RolesGuard)
  @Roles('admin', 'super_admin')
  @HttpCode(HttpStatus.OK)
  async updateConfiguration(
    @CurrentUser('id') adminId: string,
    @Body() dto: UpdateBotConfigurationDto,
  ) {
    const updated = await this.botConfigurationsService.updateConfiguration(adminId, dto);
    return {
      statusCode: HttpStatus.OK,
      message: 'Bot configuration updated successfully',
      data: updated,
    };
  }
}
