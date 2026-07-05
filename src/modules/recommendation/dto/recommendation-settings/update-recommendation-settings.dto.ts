import { PartialType } from '@nestjs/mapped-types';
import { CreateRecommendationSettingsDto } from './create-recommendation-settings.dto';

export class UpdateRecommendationSettingsDto extends PartialType(
  CreateRecommendationSettingsDto,
) {}
