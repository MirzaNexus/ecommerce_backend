import { Injectable } from '@nestjs/common';
import { EntityManager, Repository } from 'typeorm';
import { ChatbotAuditLog } from '../entities/chatbot_audit_logs.entity';

@Injectable()
export class ChatbotAuditLogRepository {
  constructor(private readonly manager: EntityManager) {}

  private repo(manager?: EntityManager): Repository<ChatbotAuditLog> {
    return (manager ?? this.manager).getRepository(ChatbotAuditLog);
  }

  async log(
    data: Partial<ChatbotAuditLog>,
    manager?: EntityManager,
  ): Promise<ChatbotAuditLog> {
    const logEntry = this.repo(manager).create(data);
    return await this.repo(manager).save(logEntry);
  }

  async findByEntity(entityId: string): Promise<ChatbotAuditLog[]> {
    return await this.repo().find({
      where: { entityId },
      order: { createdAt: 'DESC' },
    });
  }

  async findLogs(options: {
    entityId?: string;
    action?: string;
    limit?: number;
    offset?: number;
  }): Promise<[ChatbotAuditLog[], number]> {
    const query = this.repo()
      .createQueryBuilder('log')
      .leftJoinAndSelect('log.admin', 'admin')
      .orderBy('log.createdAt', 'DESC');

    if (options.entityId) {
      query.andWhere('log.entityId = :entityId', {
        entityId: options.entityId,
      });
    }

    if (options.action) {
      query.andWhere('log.action = :action', { action: options.action });
    }

    const limit = options.limit || 10;
    const offset = options.offset || 0;

    return await query.take(limit).skip(offset).getManyAndCount();
  }
}
