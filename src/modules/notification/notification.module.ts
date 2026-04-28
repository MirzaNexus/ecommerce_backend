import { Module } from '@nestjs/common';
import { NewsletterController } from './notification.controller';
import { NewsletterService } from './notification.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NewsletterSubscription } from './entities/notification.entity';
import { NewsletterRepository } from './repositories/newsletter.repository';
import { forwardRef } from '@nestjs/common';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([NewsletterSubscription]),
    forwardRef(() => UserModule),
  ],
  controllers: [NewsletterController],
  providers: [NewsletterService, NewsletterRepository],
})
export class NotificationModule {}
