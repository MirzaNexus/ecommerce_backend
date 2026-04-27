import { NewsletterRepository } from './repositories/newsletter.repository';
import { Inject } from '@nestjs/common';

import {
  BroadcastNewsDto,
  SubscribeNewsletterDto,
} from './dto/newsletter-request.dto';
import { NewsletterResponse } from './dto/newsletter-response.dto';

import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { app } from 'firebase-admin';

@Injectable()
export class NewsletterService {
  constructor(
    @Inject('FIREBASE_ADMIN')
    private readonly firebaseApp: app.App,
    private readonly newsletterRepo: NewsletterRepository,
  ) {}

  async subscribe(dto: SubscribeNewsletterDto, userId?: string) {
    return await this.newsletterRepo.upsertSubscription({
      ...dto,
      userId: userId, // Controller se pass kiya gaya userId
    });
  }

  async toggleSubscription(
    email: string,
    status: boolean,
  ): Promise<NewsletterResponse> {
    const sub = await this.newsletterRepo.findByEmail(email);
    if (!sub)
      throw new NotFoundException('No subscription found for this email.');

    await this.newsletterRepo.update({ email }, { isSubscribed: status });

    return {
      success: true,
      message: `Newsletter ${status ? 'activated' : 'deactivated'} successfully.`,
    };
  }

  async getStatus(email: string): Promise<NewsletterResponse> {
    const sub = await this.newsletterRepo.findByEmail(email);
    return {
      success: true,
      message: 'Status fetched successfully.',
      data: { isSubscribed: sub?.isSubscribed || false },
    };
  }

  async broadcast(dto: BroadcastNewsDto): Promise<NewsletterResponse> {
    try {
      // 1. Fetch only active subscribers with a token
      const activeSubscribers = await this.newsletterRepo.find({
        where: { isSubscribed: true },
      });

      // 2. Extract UNIQUE tokens to avoid Firebase duplicate errors
      const tokens = [
        ...new Set(
          activeSubscribers
            .map((subscriber) => subscriber.fcmToken)
            .filter((token): token is string => Boolean(token?.trim())),
        ),
      ];

      // 3. Early return if no valid tokens found
      if (tokens.length === 0) {
        return {
          success: false,
          message: 'No active push tokens found in the database.',
        };
      }

      console.log(`🚀 Sending broadcast to ${tokens.length} unique tokens...`);

      // 4. Send via Firebase Admin SDK

      const response = await this.firebaseApp.messaging().sendEachForMulticast({
        tokens,
        notification: {
          title: dto.title,
          body: dto.body,
        },
        data: {
          imageUrl: dto.imageUrl ?? '',
          url: 'http://localhost:3000',
        },
        webpush: {
          headers: {
            Urgency: 'high',
          },
          fcmOptions: {
            link: 'http://localhost:3000',
          },
        },
      });

      console.log('Firebase Response Summary:', {
        successCount: response.successCount,
        failureCount: response.failureCount,
      });
      console.log(
        'Firebase Detailed Responses:',
        JSON.stringify(response.responses, null, 2),
      );
      // 5. Cleanup: Identify and deactivate stale/invalid tokens
      const invalidTokens = response.responses
        .map((result, index) => {
          if (
            !result.success &&
            [
              'messaging/invalid-registration-token',
              'messaging/registration-token-not-registered',
            ].includes(result.error?.code ?? '')
          ) {
            return tokens[index];
          }
          return null;
        })
        .filter((token): token is string => token !== null);

      if (invalidTokens.length > 0) {
        await this.newsletterRepo.deactivateInvalidTokens(invalidTokens);
        console.log(
          `🧹 Cleanup: Deactivated ${invalidTokens.length} invalid tokens.`,
        );
      }

      // 6. Final success message
      return {
        success: true,
        message: `Broadcast completed. Successfully sent to ${response.successCount} device(s).`,
      };
    } catch (error: any) {
      console.error('❌ Newsletter Broadcast Error:', error);

      // Agar credential ka masla hai toh specific message dikhayen
      if (error.code === 'messaging/mismatched-credential') {
        throw new InternalServerErrorException(
          'Firebase Credential Mismatch: Check if your service account matches the client project.',
        );
      }

      throw new InternalServerErrorException(
        `Broadcast failed: ${error.message || 'Unknown error'}`,
      );
    }
  }

  async syncSubscriptionOnRegister(
    email: string,
    userId: string,
  ): Promise<void> {
    const sub = await this.newsletterRepo.findByEmail(email);
    if (sub) {
      await this.newsletterRepo.linkUserToSubscription(email, userId);
      console.log(
        `[IdentitySync] Guest ${email} successfully linked to User ${userId}`,
      );
    }
  }
}
