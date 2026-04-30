import { Injectable } from '@nestjs/common';
import { EntityManager, Repository } from 'typeorm';
import { RecommendationSettings } from '../entities/recommendation-settings.entity';

@Injectable()
export class RecommendationSettingsRepository {
  constructor(private readonly manager: EntityManager) {}

  private repo(manager?: EntityManager): Repository<RecommendationSettings> {
    return (manager ?? this.manager).getRepository(RecommendationSettings);
  }

  async getActiveSettings(): Promise<RecommendationSettings | null> {
    return await this.repo().findOne({
      where: { enabled: true },
      order: { createdAt: 'DESC' }, // Get latest active config
    });
  }

  async updateSettings(
    id: string,
    data: Partial<RecommendationSettings>,
    manager?: EntityManager,
  ): Promise<void> {
    await this.repo(manager).update(id, data);
  }

  async upsertSettings(
    data: Partial<RecommendationSettings>,
    manager?: EntityManager,
  ): Promise<RecommendationSettings> {
    const repo = this.repo(manager);

    const existing = await repo.findOne({ where: {} });

    if (existing) {
      const updated = repo.merge(existing, data);
      return await repo.save(updated);
    }

    const newSettings = repo.create(data);
    return await repo.save(newSettings);
  }

  async getSettingsWithAudit(): Promise<RecommendationSettings | null> {
    return await this.repo().findOne({
      where: {},
      order: { updatedAt: 'DESC' },
    });
  }
}
