import { Injectable } from '@nestjs/common';
import { EntityManager, Repository } from 'typeorm';
import { RecommendationEvent } from '../entities/recommendation-event.entity';

@Injectable()
export class RecommendationEventRepository {
  constructor(private readonly manager: EntityManager) {}

  private repo(manager?: EntityManager): Repository<RecommendationEvent> {
    return (manager ?? this.manager).getRepository(RecommendationEvent);
  }

  async create(
    event: Partial<RecommendationEvent>,
    manager?: EntityManager,
  ): Promise<RecommendationEvent> {
    const newEvent = this.repo(manager).create(event);
    return await this.repo(manager).save(newEvent);
  }

  async findByUserId(
    userId: string,
    limit: number = 10,
  ): Promise<RecommendationEvent[]> {
    return await this.repo().find({
      where: { user_id: userId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }
}
