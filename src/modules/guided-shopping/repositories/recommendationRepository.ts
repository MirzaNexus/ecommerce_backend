import { Injectable } from '@nestjs/common';
import { EntityManager, Repository } from 'typeorm';
import {
  RecommendationSession,
  RecommendedProduct,
} from '../entities/recommendation-result.entity';

@Injectable()
export class RecommendationRepository {
  constructor(private readonly manager: EntityManager) {}

  private sessionRepo(
    manager?: EntityManager,
  ): Repository<RecommendationSession> {
    return (manager ?? this.manager).getRepository(RecommendationSession);
  }

  private productRepo(manager?: EntityManager): Repository<RecommendedProduct> {
    return (manager ?? this.manager).getRepository(RecommendedProduct);
  }

  async createSession(
    sessionData: Partial<RecommendationSession>,
    manager?: EntityManager,
  ): Promise<RecommendationSession> {
    const repo = this.sessionRepo(manager);

    // 1. Create session first
    const session = repo.create({
      sessionId: sessionData.sessionId,
      zeroResultReason: sessionData.zeroResultReason,
    });

    const savedSession = await repo.save(session);

    // 2. Save products separately (🔥 SAFE APPROACH)
    if (sessionData.products?.length) {
      const productRepo = this.productRepo(manager);

      const products = sessionData.products.map((p) =>
        productRepo.create({
          recommendationSession: savedSession, // 🔥 CRITICAL FIX
          productId: p.productId,
          rankingScore: p.rankingScore,
          reasoning: p.reasoning,
          name: p.name,
          imageUrl: p.imageUrl,
          price: p.price,
        }),
      );

      await productRepo.save(products);
    }

    return savedSession;
  }

  /**
   * Fetches the latest recommendations for a specific chat session.
   */
  async findLatestByChatSession(
    chatSessionId: string,
    manager?: EntityManager,
  ): Promise<RecommendationSession | null> {
    return await this.sessionRepo(manager).findOne({
      where: { session: { id: chatSessionId } },
      relations: ['products', 'products.product'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Specifically finds a single recommended product's reasoning.
   */
  async findProductReasoning(
    sessionId: string,
    productId: string,
    manager?: EntityManager,
  ): Promise<RecommendedProduct | null> {
    return await this.productRepo(manager).findOne({
      where: { recommendationSessionId: sessionId, productId },
    });
  }
}
