import { Injectable, BadRequestException } from '@nestjs/common';
import * as sanitizeHtml from 'sanitize-html';
import { CreateChatMessageDto } from '../../dto/chat-message.dto';
import { MessageProcessResponseDto } from '../../dto/response/guided-shoping-response.dto';

@Injectable()
export class MessageProcessorService {
  private readonly MAX_LENGTH = 1000;

  async processIncoming(
    dto: CreateChatMessageDto,
  ): Promise<MessageProcessResponseDto> {
    if (dto.content.length > this.MAX_LENGTH) {
      throw new BadRequestException(
        `Message too long (${dto.content.length}/${this.MAX_LENGTH})`,
      );
    }

    const cleaner =
      typeof sanitizeHtml === 'function'
        ? sanitizeHtml
        : (sanitizeHtml as any).default;

    if (typeof cleaner !== 'function') {
      throw new Error('Sanitize-html library failed to load correctly.');
    }

    const sanitized = cleaner(dto.content, {
      allowedTags: [],
      allowedAttributes: {},
    });

    const normalized = this.normalizeText(sanitized);

    return {
      isValid: true,
      sanitizedContent: normalized,
      length: normalized.length,
    };
  }

  private normalizeText(text: string): string {
    return text.trim().replace(/\s+/g, ' ');
  }
}
