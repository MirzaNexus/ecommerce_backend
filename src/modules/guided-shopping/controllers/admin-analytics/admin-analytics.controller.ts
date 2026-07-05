import { Controller, Get } from '@nestjs/common';
import { ChatbotAnalyticsService } from '../../services/chatbot-analytics/chatbot-analytics.service';

@Controller('admin/analytics')
export class AdminAnalyticsController {
  constructor(private readonly analyticsService: ChatbotAnalyticsService) {}

  @Get('overview')
  async getOverview() {
    return await this.analyticsService.getPerformanceOverview();
  }
}
