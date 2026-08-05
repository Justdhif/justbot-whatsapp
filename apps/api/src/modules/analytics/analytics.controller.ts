import { Controller, Get, Query } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

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
