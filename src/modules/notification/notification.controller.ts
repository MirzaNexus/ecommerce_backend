import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Req,
  Param,
  UseGuards,
} from '@nestjs/common';

import { NewsletterService } from './notification.service';

import {
  SubscribeNewsletterDto,
  UpdateSubscriptionStatusDto,
  BroadcastNewsDto,
} from './dto/newsletter-request.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guards';
import { RolesGuard } from '../auth/guards/role.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../user/entities/user.entity';

@Controller('newsletter')
export class NewsletterController {
  constructor(private readonly newsletterService: NewsletterService) {}

  /**
   * POST /newsletter/subscribe
   * Creates or updates a subscription (Public)
   */
  @Post('subscribe')
  async subscribe(@Body() dto: SubscribeNewsletterDto, @Req() req) {
    const userId = req.user?.id || null;
    return this.newsletterService.subscribe(dto, userId);
  }

  /**
   * PATCH /newsletter/status/:email
   * Toggles subscription status (Public)
   */
  @Patch('status/:email')
  async updateStatus(
    @Param('email') email: string,
    @Body() dto: UpdateSubscriptionStatusDto,
  ) {
    return await this.newsletterService.toggleSubscription(
      email,
      dto.isSubscribed,
    );
  }

  /**
   * GET /newsletter/status/:email
   * Check if an email is currently subscribed (Public)
   */
  @Get('status/:email')
  async getStatus(@Param('email') email: string) {
    return await this.newsletterService.getStatus(email);
  }

  /**
   * POST /newsletter/broadcast
   * Sends push notifications via Firebase (Admin Only)
   */
  @Post('broadcast')
  @Roles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async broadcast(@Body() dto: BroadcastNewsDto) {
    return await this.newsletterService.broadcast(dto);
  }
}
