import { Injectable } from '@nestjs/common';
import { EntityManager, Repository } from 'typeorm';
import { ChatMessage } from '../entities/chat-message.entity';

@Injectable()
export class ChatMessageRepository {
  constructor(private readonly manager: EntityManager) {}

  private repo(manager?: EntityManager): Repository<ChatMessage> {
    return (manager ?? this.manager).getRepository(ChatMessage);
  }

  async saveMessage(
    message: Partial<ChatMessage>,
    manager?: EntityManager,
  ): Promise<ChatMessage> {
    const newMessage = this.repo(manager).create(message);
    return await this.repo(manager).save(newMessage);
  }

  async findBySession(
    sessionId: string,
    manager?: EntityManager,
  ): Promise<ChatMessage[]> {
    return await this.repo(manager).find({
      where: { sessionId },
      order: { createdAt: 'ASC' },
      relations: ['session'],
    });
  }

  async getLatestMessage(
    sessionId: string,
    manager?: EntityManager,
  ): Promise<ChatMessage | null> {
    return await this.repo(manager).findOne({
      where: { sessionId },
      order: { createdAt: 'DESC' },
    });
  }
}
