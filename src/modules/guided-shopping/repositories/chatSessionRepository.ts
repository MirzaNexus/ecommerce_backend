import { Injectable } from '@nestjs/common';
import { EntityManager, Repository, UpdateResult } from 'typeorm';
import { SessionMetadata } from '../enums/chatbot.enum';
import { ChatSession } from '../entities/chat-session.entity';
import { SessionStatus } from '../enums/chatbot.enum';
import { LessThan } from 'typeorm';
import * as lodash from 'lodash'; // Deep merge ke liye standard library

@Injectable()
export class ChatSessionRepository {
  constructor(private readonly manager: EntityManager) {}

  private repo(manager?: EntityManager): Repository<ChatSession> {
    return (manager ?? this.manager).getRepository(ChatSession);
  }

  async create(
    session: Partial<ChatSession>,
    manager?: EntityManager,
  ): Promise<ChatSession> {
    const newSession = this.repo(manager).create(session);
    return await this.repo(manager).save(newSession);
  }

  async findById(
    id: string,
    relations: string[] = [],
    manager?: EntityManager,
  ): Promise<ChatSession | null> {
    return await this.repo(manager).findOne({ where: { id }, relations });
  }

  /**
   * Deep merges new metadata with existing session metadata
   */
  async updateMetadata(
    id: string,
    newMetadata: Partial<SessionMetadata>,
    manager?: EntityManager,
  ): Promise<ChatSession> {
    const session = await this.repo(manager).findOneOrFail({ where: { id } });
    session.metadata = lodash.merge({}, session.metadata, newMetadata);
    return await this.repo(manager).save(session);
  }

  async updateStatus(
    id: string,
    status: SessionStatus,
    manager?: EntityManager,
  ): Promise<UpdateResult> {
    return await this.repo(manager).update(id, { status });
  }

  async findActiveByBuyer(
    buyerId: string,
    manager?: EntityManager,
  ): Promise<ChatSession | null> {
    return await this.repo(manager).findOne({
      where: { buyerId, status: SessionStatus.ACTIVE },
      order: { createdAt: 'DESC' },
    });
  }

  async markExpiredSessions(
    expiryDate: Date,
    manager?: EntityManager,
  ): Promise<UpdateResult> {
    return await this.repo(manager).update(
      {
        expiresAt: LessThan(expiryDate),
        status: SessionStatus.ACTIVE,
      },
      { status: SessionStatus.EXPIRED },
    );
  }

  async updateSessionMetadata(
    sessionId: string,
    metadata: any,
    manager?: EntityManager,
  ): Promise<void> {
    await this.repo(manager).update(sessionId, { metadata });
  }
}
