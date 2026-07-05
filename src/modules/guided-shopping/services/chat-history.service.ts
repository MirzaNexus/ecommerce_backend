import { Injectable } from '@nestjs/common';
import { ChatMessageRepository } from '../repositories/chatMessageRepository';
import { ChatMessage } from '../entities/chat-message.entity';
import { MessageRole } from '../enums/chatbot.enum';
import { EntityManager } from 'typeorm';

@Injectable()
export class ChatHistoryService {
  constructor(private readonly messageRepo: ChatMessageRepository) {}

  async recordMessage(
    sessionId: string,
    content: string,
    role: MessageRole,
    metadata?: any,
    manager?: EntityManager,
  ): Promise<ChatMessage> {
    return await this.messageRepo.saveMessage(
      {
        sessionId,
        content,
        role,
        metadata: metadata ? JSON.stringify(metadata) : null,
      } as Partial<ChatMessage>,
      manager,
    );
  }

  async getSessionHistory(sessionId: string): Promise<ChatMessage[]> {
    return await this.messageRepo.findBySession(sessionId);
  }
}
