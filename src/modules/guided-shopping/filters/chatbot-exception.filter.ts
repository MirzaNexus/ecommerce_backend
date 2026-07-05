import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

@Catch() // Ye sirf is module ke errors pakray ga
export class ChatbotExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('ChatbotError');

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    this.logger.error(`Chatbot Error: ${exception.message}`, exception.stack);

    // Chatbot ke liye hamesha 200 OK bhejte hain taake UI crash na ho
    // Lekin response body mein batate hain ke masla hua hai
    const errorResponse = {
      message:
        'Maafi chahta hoon, mere servers thora thak gaye hain. Kya aap dobara koshish karenge?',
      actionType: 'ERROR',
      suggestionPrompts: ['Koshish Dobara', 'Support se baat karein'],
      recommendations: { products: [], totalMatches: 0 },
    };

    response.status(HttpStatus.OK).json(errorResponse);
  }
}
