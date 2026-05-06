import { Controller, UseGuards, Get, Query } from '@nestjs/common';
import { Roles } from 'src/modules/auth/decorators/roles.decorator';
import { RolesGuard } from 'src/modules/auth/guards/role.guard';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guards';
import { UserRole } from 'src/modules/user/entities/user.entity';
import { ChatbotAuditLogService } from '../services/chatbot-audit-log.service';

@Controller('admin/audit-logs')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminAuditController {
  constructor(private readonly auditService: ChatbotAuditLogService) {}

  @Get()
  async fetchLogs(
    @Query('entityId') entityId?: string,
    @Query('action') action?: string,
    @Query('page') page?: number,
  ) {
    return await this.auditService.getLogs({ entityId, action, page });
  }
}
