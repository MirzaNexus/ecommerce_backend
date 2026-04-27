import { Injectable } from '@nestjs/common';
import { NewsletterService } from '../notification.service';
import { OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class NewsletterListener {
  constructor(private readonly newsletterService: NewsletterService) {}

  @OnEvent('user.registered') // Ye event Auth module fire karega
  async handleUserRegistered(payload: { email: string; userId: string }) {
    await this.newsletterService.syncSubscriptionOnRegister(
      payload.email,
      payload.userId,
    );
  }
}
