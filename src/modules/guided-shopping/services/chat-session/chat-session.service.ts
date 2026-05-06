import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { ChatSessionRepository } from '../../repositories/chatSessionRepository';
import { CreateChatSessionDto } from '../../dto/chat-session.dto';
import { ChatSessionResponseDto } from '../../dto/response/guided-shoping-response.dto';
import { SessionStatus } from '../../enums/chatbot.enum';
import { ChatSession } from '../../entities/chat-session.entity';
import { ChatHistoryService } from '../chat-history.service';
import { MessageRole } from '../../enums/chatbot.enum';

@Injectable()
export class ChatSessionService {
  constructor(
    private readonly sessionRepo: ChatSessionRepository,
    private readonly entityManager: EntityManager,
    private readonly chatHistorySerivce: ChatHistoryService,
  ) {}

  async initializeSession(
    dto: CreateChatSessionDto,
  ): Promise<ChatSessionResponseDto> {
    return await this.entityManager.transaction(async (manager) => {
      if (dto.buyerId) {
        const activeSession = await this.sessionRepo.findActiveByBuyer(
          dto.buyerId,
          manager,
        );
        if (activeSession) return this.mapToResponse(activeSession);
      }

      const session = await this.sessionRepo.create(
        {
          buyerId: dto.buyerId,
          status: SessionStatus.ACTIVE,
          expiresAt: dto.expiresAt,
          metadata: dto.metadata,
          contextVersion: 1,
        },
        manager,
      );

      const greetingContent =
        'Assalam-o-Alaikum! Main aapka AI shopping assistant hoon. Aaj main aapki kya madad kar sakta hoon? (Maslan: Mujhe watches dikhao ya 50k tak ka phone chahiye)';

      await this.chatHistorySerivce.recordMessage(
        session.id,
        greetingContent,
        MessageRole.BOT,
        { isGreeting: true },
        manager,
      );
      return this.mapToResponse(session);
    });
  }

  async trackLastViewedProduct(
    sessionId: string,
    productId: string,
    productName: string,
  ) {
    // Business Logic: Sirf metadata ka wo hissa bhejein jo update karna hai
    const metadataUpdate = {
      customFlags: {
        lastViewedProductId: productId,
        lastViewedProductName: productName,
      },
    };

    // Repository ka existing method call karein
    return await this.sessionRepo.updateMetadata(sessionId, metadataUpdate);
  }

  async resumeSession(sessionId: string): Promise<ChatSessionResponseDto> {
    const session = await this.sessionRepo.findById(sessionId);

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    if (
      session.status === SessionStatus.EXPIRED ||
      new Date() > session.expiresAt
    ) {
      await this.sessionRepo.updateStatus(sessionId, SessionStatus.EXPIRED);
      throw new UnauthorizedException('Session has expired');
    }

    return this.mapToResponse(session);
  }

  async validateOwnership(
    sessionId: string,
    buyerId: string,
  ): Promise<boolean> {
    const session = await this.sessionRepo.findById(sessionId);
    if (!session || session.buyerId !== buyerId) {
      throw new UnauthorizedException(
        'You do not have permission to access this session',
      );
    }
    return true;
  }

  async handleExpiration(): Promise<void> {
    await this.sessionRepo.markExpiredSessions(new Date());
  }

  private mapToResponse(session: ChatSession): ChatSessionResponseDto {
    return {
      id: session.id,
      status: session.status,
      buyerId: session.buyerId,
      expiresAt: session.expiresAt,
      contextVersion: session.contextVersion,
      metadata: session.metadata,
    };
  }
}
