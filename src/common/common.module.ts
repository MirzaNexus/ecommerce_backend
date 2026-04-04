import { Module } from '@nestjs/common';

import { LoggingService } from './services/logging.service';
import { AuditLogService } from './services/audit-log.service';

@Module({
  providers: [LoggingService, AuditLogService],
  exports: [LoggingService, AuditLogService],
})
export class CommonModule {}
