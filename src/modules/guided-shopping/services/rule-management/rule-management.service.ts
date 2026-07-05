import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ChatbotRuleRepository } from '../../repositories/chatbot-rule.repository';
import { ChatbotAuditLog } from '../../entities/chatbot_audit_logs.entity';
import { ChatbotRule } from '../../entities/chatbot-rule.entity';
import { ChatbotAuditLogService } from '../chatbot-audit-log.service';

@Injectable()
export class RuleManagementService {
  constructor(
    private readonly ruleRepo: ChatbotRuleRepository,
    private readonly dataSource: DataSource,
    private readonly auditService: ChatbotAuditLogService,
  ) {}

  async createRule(dto: any, adminId: string): Promise<ChatbotRule> {
    return await this.dataSource.transaction(async (manager) => {
      const rule = await this.ruleRepo.saveRule(dto, manager);

      await this.auditService.record(
        {
          adminId,
          entityId: rule.id,
          action: 'CREATE_RULE',
          newValue: {
            entityId: rule.id,
            fields: rule,
            version: 1,
            metadata: {
              context: 'Admin Dashboard',
              timestamp: new Date().toISOString(),
            },
          },
        },
        manager,
      );

      return rule;
    });
  }

  async toggleRuleStatus(id: string, adminId: string): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      const existing = await this.ruleRepo.findById(id, manager);
      if (!existing) throw new NotFoundException('Rule not found');

      const updated = await this.ruleRepo.updateRule(
        id,
        { isActive: !existing.isActive },
        manager,
      );

      await this.auditService.record(
        {
          adminId,
          entityId: id,
          action: 'TOGGLE_RULE',
          oldValue: {
            entityId: id,
            fields: { isActive: existing.isActive },
          },
          newValue: {
            entityId: id,
            fields: { isActive: updated.isActive },
          },
        },
        manager,
      );
    });
  }

  async getRulesForBot(): Promise<ChatbotRule[]> {
    return await this.ruleRepo.findActiveRules();
  }
}
