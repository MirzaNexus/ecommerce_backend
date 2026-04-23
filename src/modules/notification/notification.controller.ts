import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';

import { NewsletterService } from './notification.service';
import { SubscribeNewsletterDto } from './dto/newsletter-request.dto';
@Controller('newsletter')
export class NewsletterController {
  constructor(private readonly newsletterService: NewsletterService) {}

  @Post('subscribe')
  async subscribe(@Body() dto: SubscribeNewsletterDto) {
    const result = await this.newsletterService.subscribe(dto);
    return {
      success: true,
      message: 'Subscription successful',
      data: result,
    };
  }
}
