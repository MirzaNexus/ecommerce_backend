import { Injectable } from '@nestjs/common';
import { EntityManager, Repository } from 'typeorm';
import { UserCategoryAffinity } from '../entities/user-category-affinity.entity';

@Injectable()
export class UserCategoryAffinityRepository {
  constructor(private readonly manager: EntityManager) {}

  private repo(manager?: EntityManager): Repository<UserCategoryAffinity> {
    return (manager ?? this.manager).getRepository(UserCategoryAffinity);
  }

  create(
    data: Partial<UserCategoryAffinity>,
    manager?: EntityManager,
  ): UserCategoryAffinity {
    return this.repo(manager).create(data);
  }

  async findByUserAndCategory(
    userId: string,
    categoryId: string,
    manager?: EntityManager,
  ): Promise<UserCategoryAffinity | null> {
    return await this.repo(manager).findOne({
      where: { user_id: userId, category_id: categoryId },
    });
  }

  async upsertAffinity(
    affinity: Partial<UserCategoryAffinity>,
    manager?: EntityManager,
  ): Promise<UserCategoryAffinity> {
    return await this.repo(manager).save(affinity);
  }

  async getTopAffinities(
    userId: string,
    limit: number = 5,
  ): Promise<UserCategoryAffinity[]> {
    return await this.repo().find({
      where: { user_id: userId },
      order: { affinity_score: 'DESC' },
      take: limit,
    });
  }

  async getGlobalTopCategories(limit: number = 10): Promise<any[]> {
    return await this.repo()
      .createQueryBuilder('affinity')
      .select('affinity.category_id', 'categoryId')
      .addSelect('SUM(affinity.affinity_score)', 'totalScore')
      .groupBy('affinity.category_id')
      .orderBy('SUM(affinity.affinity_score)', 'DESC')
      .limit(limit)
      .getRawMany();
  }
}
