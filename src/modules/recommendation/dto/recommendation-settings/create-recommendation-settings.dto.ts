import { IsBoolean, IsNumber, Min, Max, IsOptional } from 'class-validator';

export class CreateRecommendationSettingsDto {
  @IsBoolean({ message: 'enabled must be a boolean value' })
  enabled!: boolean;

  @IsNumber({}, { message: 'related_products_limit must be a number' })
  @Min(1, { message: 'related_products_limit must be at least 1' })
  related_products_limit!: number;

  // Renamed from behavioral_weight to match Entity
  @IsBoolean({ message: 'category_priority_enabled must be boolean' })
  category_priority_enabled!: boolean;

  // Renamed from price_weight to match Entity
  @IsNumber({}, { message: 'price_similarity_factor must be a number' })
  @Min(0, { message: 'price_similarity_factor cannot be negative' })
  @Max(1, { message: 'price_similarity_factor cannot exceed 1' })
  price_similarity_factor!: number;

  // This is a new field we should add to the Entity if you want to control fallback logic
  @IsBoolean({ message: 'fallback_enabled must be boolean' })
  @IsOptional()
  fallback_enabled?: boolean;
}
