// src/modules/guided-shopping/infrastructure/repositories/chatbot-interaction.repository.ts

import { Injectable } from '@nestjs/common';
import { EntityManager, Repository } from 'typeorm';
import { ChatbotInteraction } from '../entities/chatbot-interaction.entity';

@Injectable()
export class ChatbotInteractionRepository {
  constructor(private readonly manager: EntityManager) {}

  private repo(manager?: EntityManager): Repository<ChatbotInteraction> {
    return (manager ?? this.manager).getRepository(ChatbotInteraction);
  }

  async logInteraction(
    data: Partial<ChatbotInteraction>,
    manager?: EntityManager,
  ): Promise<void> {
    const interaction = this.repo(manager).create(data);
    await this.repo(manager).save(interaction);
  }

  /**
   * Zero Result Report: Un queries ka count nikalna jahan products nahi mile.
   */
  async getZeroResultStats(manager?: EntityManager) {
    return await this.repo(manager)
      .createQueryBuilder('interaction')
      .select('interaction.userIntent', 'intent')
      .addSelect('COUNT(*)', 'count')
      .where('interaction.isZeroResult = :isZero', { isZero: true })
      .groupBy('interaction.userIntent')
      .getRawMany();
  }

  /**
   * Conversion/Abandonment tracking ke liye basic stats
   */
  async getStatsByPromptVersion(promptId: string, manager?: EntityManager) {
    return await this.repo(manager).count({
      where: { promptTemplateId: promptId },
    });
  }

  async getConversionStats(manager?: EntityManager) {
    return await (manager ?? this.manager)
      .createQueryBuilder('order', 'o')
      .select('COUNT(o.id)', 'totalOrders')
      .addSelect('SUM(o.totalAmount)', 'totalRevenue')
      .where('o.chatbotSessionId IS NOT NULL')
      .getRawOne();
  }
}
