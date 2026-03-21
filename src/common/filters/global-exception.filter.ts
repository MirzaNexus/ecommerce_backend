import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();

    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();

      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object') {
        const res: any = exceptionResponse;

        if (Array.isArray(res.message)) {
          message = res.message; // or res.message[0] for single
        } else if (res.message) {
          message = res.message;
        }
      }
    } else if (exception.code) {
      switch (exception.code) {
        case '23502': // NOT NULL violation
          status = HttpStatus.BAD_REQUEST;
          message = `Missing required field: ${exception.column}`;
          break;

        case '23505': // UNIQUE violation
          status = HttpStatus.CONFLICT;
          message = 'Duplicate value already exists';
          break;

        default:
          message = 'Database error';
      }
    } else {
      console.error('Unhandled Exception:', exception);
    }

    response.status(status).json({
      success: false,
      statusCode: status,
      message,
      path: request.url,
      requestId: request['requestId'] || null,
      timestamp: new Date().toISOString(),
    });
  }
}
