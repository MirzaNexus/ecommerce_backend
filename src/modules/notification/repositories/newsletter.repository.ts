import { Injectable } from '@nestjs/common';
import { NewsletterSubscription } from '../entities/notification.entity';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class NewsletterRepository extends Repository<NewsletterSubscription> {
  constructor(private dataSource: DataSource) {
    super(NewsletterSubscription, dataSource.createEntityManager());
  }

  async findByEmail(email: string) {
    return this.findOne({ where: { email } });
  }

  async upsertSubscription(data: Partial<NewsletterSubscription>) {
    const existing = await this.findByEmail(data.email!);
    if (existing) {
      Object.assign(existing, { ...data, isSubscribed: true });
      return await this.save(existing);
    }
    return await this.save(this.create(data));
  }

  async linkUserToSubscription(email: string, userId: string) {
    return await this.update({ email }, { userId });
  }
}
