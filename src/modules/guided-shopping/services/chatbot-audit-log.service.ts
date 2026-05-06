import { Injectable } from '@nestjs/common';
import { ChatbotAuditLogRepository } from '../repositories/chatbot-audit-log.repository';
import { EntityManager } from 'typeorm';
import { CreateChatbotAuditLogDto } from '../dto/audit-log.dto';

@Injectable()
export class ChatbotAuditLogService {
  constructor(private readonly auditRepo: ChatbotAuditLogRepository) {}

  async record(dto: CreateChatbotAuditLogDto, manager?: EntityManager) {
    return await this.auditRepo.log(dto, manager);
  }

  async getLogs(queryDto: {
    entityId?: string;
    action?: string;
    page?: number;
    limit?: number;
  }) {
    const limit = Number(queryDto.limit) || 10;
    const page = Number(queryDto.page) || 1;
    const offset = (page - 1) * limit;

    const [logs, total] = await this.auditRepo.findLogs({
      entityId: queryDto.entityId,
      action: queryDto.action,
      limit,
      offset,
    });

    const totalPages = Math.ceil(total / limit);

    return {
      data: logs,
      meta: {
        totalItems: total,
        itemCount: logs.length,
        itemsPerPage: limit,
        totalPages: totalPages,
        currentPage: page,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }
}
