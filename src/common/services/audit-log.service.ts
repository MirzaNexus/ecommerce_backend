import { Injectable } from '@nestjs/common';

@Injectable()
export class AuditLogService {
  async record(event: {
    userId?: string;
    userRole?: string;
    action?: string;
    entity?: string;
    entityId?: string;
    metadata?: any;
  }) {
    console.log('AUDIT EVENT:', {
      ...event,
      timestamp: new Date(),
    });
  }
}
