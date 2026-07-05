// src/modules/guided-shopping/infrastructure/repositories/chatbot-rule.repository.ts

import { Injectable } from '@nestjs/common';
import { EntityManager, Repository } from 'typeorm';
import { ChatbotRule } from '../entities/chatbot-rule.entity';

@Injectable()
export class ChatbotRuleRepository {
  constructor(private readonly manager: EntityManager) {}

  private repo(manager?: EntityManager): Repository<ChatbotRule> {
    return (manager ?? this.manager).getRepository(ChatbotRule);
  }

  /**
   * Sare active rules priority ke hisaab se fetch karta hai.
   * Taake bot sab se pehle important rules apply kare.
   */
  async findActiveRules(manager?: EntityManager): Promise<ChatbotRule[]> {
    return await this.repo(manager).find({
      where: { isActive: true },
      order: { priority: 'DESC' },
    });
  }

  /**
   * Rule save ya update karne ke liye (Transactional support)
   */
  async saveRule(
    rule: Partial<ChatbotRule>,
    manager?: EntityManager,
  ): Promise<ChatbotRule> {
    const r = this.repo(manager).create(rule);
    return await this.repo(manager).save(r);
  }

  async findById(
    id: string,
    manager?: EntityManager,
    withLock: boolean = false, // Add locking support
  ): Promise<ChatbotRule | null> {
    const options: any = { where: { id } };
    if (withLock) {
      options.lock = { mode: 'pessimistic_write' };
    }
    return await this.repo(manager).findOne(options);
  }

  async deleteRule(id: string, manager?: EntityManager): Promise<void> {
    await this.repo(manager).delete(id);
  }

  async findAllRules(manager?: EntityManager): Promise<ChatbotRule[]> {
    return await this.repo(manager).find({
      order: { priority: 'DESC', createdAt: 'DESC' },
    });
  }

  /**
   * Atomic update to prevent partial data corruption
   */
  async updateRule(
    id: string,
    data: Partial<ChatbotRule>,
    manager?: EntityManager,
  ): Promise<ChatbotRule> {
    await this.repo(manager).update(id, data);
    const updated = await this.repo(manager).findOne({ where: { id } });
    if (!updated) throw new Error('Rule not found after update');
    return updated;
  }
}
