import { Injectable } from '@nestjs/common';
import { ChatbotInteractionRepository } from '../../repositories/chatbot-interaction.repository';

@Injectable()
export class ChatbotAnalyticsService {
  constructor(private readonly interactionRepo: ChatbotInteractionRepository) {}

  async getPerformanceOverview() {
    const zeroResults = await this.interactionRepo.getZeroResultStats();
    const totalHits = await this.interactionRepo.getStatsByPromptVersion('all');

    // 1. Fetch Order Data linked to Chatbot
    const conversionData = await this.interactionRepo.getConversionStats();

    const totalOrders = parseInt(conversionData.totalOrders || '0');
    const totalRevenue = parseFloat(conversionData.totalRevenue || '0');

    // 2. Calculate Conversion Rate (CR)
    // Formula: (Orders / Total Interactions) * 100
    const conversionRate =
      totalHits > 0 ? ((totalOrders / totalHits) * 100).toFixed(2) : '0.00';

    return {
      overview: {
        totalInteractions: totalHits,
        totalConvertedOrders: totalOrders,
        totalRevenueGenerated: totalRevenue,
        conversionRate: `${conversionRate}%`,
      },
      zeroResultIntents: zeroResults.map((r) => ({
        intent: r.intent || 'Unknown',
        count: parseInt(r.count),
      })),
      timestamp: new Date(),
    };
  }

  async trackInteraction(data: {
    sessionId: string;
    promptId: string;
    intent: string;
    isZero: boolean;
    metadata?: any;
  }) {
    // Repository method called to keep Service clean
    await this.interactionRepo.logInteraction({
      sessionId: data.sessionId,
      promptTemplateId: data.promptId,
      userIntent: data.intent,
      isZeroResult: data.isZero,
      metadata: data.metadata,
    });
  }
}
