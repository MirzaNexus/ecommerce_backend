import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  UseInterceptors,
  ClassSerializerInterceptor,
  HttpStatus,
  HttpCode,
  Req,
} from '@nestjs/common';
import { RecommendationService } from './recommendation.service';
import { CreateRecommendationEventDto } from './dto/recommendation-event/create-recommendation-event.dto';
import { RecommendationListResponseDto } from './dto/recommendedProductResponseDto';
import { TrackingResponseDto } from './dto/recommendation-event/trackingResponseDto';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guards';

@Controller('recommendations')
@UseInterceptors(ClassSerializerInterceptor) // Essential for Phase 3 DTO @Expose() logic
export class RecommendationController {
  constructor(private readonly recService: RecommendationService) {}

  @Get('related')
  @UseGuards(JwtAuthGuard) // Protect the route
  @HttpCode(HttpStatus.OK)
  async getRelatedProducts(
    @Query('product_id') productId: string,
    @Query('category_id') categoryId: string,
    @Query('page') page: number = 1,
    @Req() req: any,
  ): Promise<RecommendationListResponseDto> {
    const userId = req.user.id;

    return await this.recService.getRecommendedProducts(
      productId,
      categoryId,
      userId,
      page,
    );
  }

  @Post('track')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.ACCEPTED)
  async trackConversion(
    @Body() dto: CreateRecommendationEventDto,
  ): Promise<TrackingResponseDto> {
    await this.recService.trackConversion(dto);

    return {
      success: true,
      message: `Event ${dto.event_type} processed successfully`,
      tracked_at: new Date(),
    };
  }

  @Get('search')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async search(@Query('q') query: string, @Req() req: any) {
    const userId = req.user?.id;
    return await this.recService.searchProducts(query, userId);
  }
}
