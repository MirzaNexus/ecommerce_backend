import { Injectable } from '@nestjs/common';
import { EntityManager, Repository } from 'typeorm';
import { ShoppingIntent } from '../entities/shopping-intent.entity';
import { IShoppingFeatures } from '../enums/chatbot.enum';

import * as lodash from 'lodash';

@Injectable()
export class ShoppingIntentRepository {
  constructor(private readonly manager: EntityManager) {}

  private repo(manager?: EntityManager): Repository<ShoppingIntent> {
    return (manager ?? this.manager).getRepository(ShoppingIntent);
  }
  /**
   * Deep merges extracted features and intent data
   */
  async upsertIntent(
    intentData: Partial<ShoppingIntent>,
    manager?: EntityManager,
  ): Promise<ShoppingIntent> {
    const { sessionId, features, ...otherData } = intentData;

    const existing = await this.repo(manager).findOne({ where: { sessionId } });

    if (existing) {
      // Deep merge existing features with new incoming features
      const mergedFeatures = lodash.merge({}, existing.features, features);

      // Update other fields and increment version
      const updated = this.repo(manager).merge(existing, {
        ...otherData,
        features: mergedFeatures,
        version: existing.version + 1,
      });

      return await this.repo(manager).save(updated);
    }

    const newIntent = this.repo(manager).create(intentData);
    return await this.repo(manager).save(newIntent);
  }

  async findBySession(
    sessionId: string,
    manager?: EntityManager,
  ): Promise<ShoppingIntent | null> {
    return await this.repo(manager).findOne({
      where: { sessionId },
      relations: ['category', 'session'],
    });
  }
}
