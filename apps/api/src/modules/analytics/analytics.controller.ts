import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CreateActivityLogDto } from './dto/create-activity-log.dto';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Post('logs')
  async createActivityLog(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateActivityLogDto,
  ) {
    const data = await this.analyticsService.createActivityLog(userId, dto);
    return { success: true, message: 'Log aktivitas bot berhasil disimpan', data };
  }

  @Get('message-stats')
  async getMessageStats(
    @CurrentUser('id') userId: string,
    @Query('period') period?: '7d' | '30d' | '90d',
  ) {
    const data = await this.analyticsService.getMessageStats(userId, period);
    return { success: true, data };
  }

  @Get('recent-activity')
  async getRecentActivity(@CurrentUser('id') userId: string) {
    const data = await this.analyticsService.getRecentActivity(userId);
    return { success: true, data };
  }
}
