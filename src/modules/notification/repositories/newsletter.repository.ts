import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NewsletterSubscription } from '../entities/notification.entity';

@Injectable()
export class NewsletterRepository {
  constructor(
    @InjectRepository(NewsletterSubscription)
    private readonly repo: Repository<NewsletterSubscription>,
  ) {}

  async findByEmail(email: string) {
    return await this.repo.findOne({ where: { email } });
  }

  async find(options: any) {
    return await this.repo.find(options);
  }

  async update(criteria: any, partialEntity: any) {
    return await this.repo.update(criteria, partialEntity);
  }

  async upsertSubscription(data: Partial<NewsletterSubscription>) {
    // 1. Check if record exists by email
    const existing = await this.repo.findOne({
      where: { email: data.email },
    });

    if (existing) {
      // 🟢 Logic: ID preservation & Smart Merge
      const updateData = {
        ...data,
        isSubscribed: true,
        // Existing userId ko bacha kar rakhna agar naya data null ho
        userId: data.userId || existing.userId,
      };

      Object.assign(existing, updateData);
      return await this.repo.save(existing);
    }

    // 2. Agar naya user hai toh create karein
    const newSub = this.repo.create({
      ...data,
      isSubscribed: true,
    });

    return await this.repo.save(newSub);
  }

  async linkUserToSubscription(email: string, userId: string) {
    // Identity sync ke liye update query
    return await this.repo.update({ email }, { userId });
  }
  async deactivateInvalidTokens(tokens: string[]): Promise<void> {
    await this.repo
      .createQueryBuilder()
      .update()
      .set({
        fcmToken: null,
        isSubscribed: false,
      })
      .where('fcmToken IN (:...tokens)', { tokens })
      .execute();
  }
}
