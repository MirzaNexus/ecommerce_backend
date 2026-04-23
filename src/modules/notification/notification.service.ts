import { Injectable } from '@nestjs/common';
import { NewsletterRepository } from './repositories/newsletter.repository';
import { SubscribeNewsletterDto } from './dto/newsletter-request.dto';

@Injectable()
export class NewsletterService {
  constructor(private readonly newsletterRepo: NewsletterRepository) {}

  async subscribe(dto: SubscribeNewsletterDto) {
    return await this.newsletterRepo.upsertSubscription(dto);
  }

  async syncSubscriptionOnRegister(email: string, userId: string) {
    try {
      const sub = await this.newsletterRepo.findByEmail(email);
      if (sub) {
        await this.newsletterRepo.linkUserToSubscription(email, userId);
      }
    } catch (error) {
      // Background task fail hone par main thread block nahi hona chahiye
      console.error('[Newsletter Sync Error]:', (error as any).message);
    }
  }
}
