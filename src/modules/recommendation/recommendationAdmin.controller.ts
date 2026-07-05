import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  UseInterceptors,
  ClassSerializerInterceptor,
  HttpStatus,
  HttpCode,
  UseGuards,
} from '@nestjs/common';

import { RecommendationService } from './recommendation.service';

import { AdminSettingsResponseDto } from './dto/recommendation-settings/adminSettingsResponseDto';
import { CreateRecommendationSettingsDto } from './dto/recommendation-settings/create-recommendation-settings.dto';
import { SyncJobResultDto } from './dto/syncJobResultDto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guards';

@Controller('recommendations/admin')
@UseGuards(JwtAuthGuard)
@UseInterceptors(ClassSerializerInterceptor)
export class RecommendationAdminController {
  constructor(private readonly adminService: RecommendationService) {}

  @Patch('settings')
  @HttpCode(HttpStatus.OK)
  async updateSettings(
    @Body() dto: CreateRecommendationSettingsDto,
  ): Promise<AdminSettingsResponseDto> {
    return await this.adminService.updateConfiguration(dto);
  }

  @Post('sync')
  @HttpCode(HttpStatus.ACCEPTED)
  async triggerSync(): Promise<SyncJobResultDto> {
    return await this.adminService.fullReindex();
  }

  @Get('metrics')
  @HttpCode(HttpStatus.OK)
  async getSystemMetrics() {
    return await this.adminService.getSystemHealthMetrics();
  }
}
