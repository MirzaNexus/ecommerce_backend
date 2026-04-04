import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';

import { Observable, tap } from 'rxjs';
import { LoggingService } from '../services/logging.service';

@Injectable()
export class RequestLoggingInterceptor implements NestInterceptor {
  constructor(private logger: LoggingService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();

    const method = request.method;
    const url = request.url;
    const requestId = request.requestId;
    const userId = request.user ? request.user.id : 'anonymous';

    const startTime = Date.now();

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - startTime;

        this.logger.log(
          `${method} ${url} - ${duration}ms - requestId:${requestId} - userId:${userId}`,
          'HTTP',
        );
      }),
    );
  }
}
