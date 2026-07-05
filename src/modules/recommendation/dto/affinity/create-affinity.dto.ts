import { IsUUID, IsOptional, IsNumber, Min } from 'class-validator';

export class CreateUserCategoryAffinityDto {
  @IsUUID('4', { message: 'user_id must be a valid UUID v4 format' })
  user_id!: string;

  @IsUUID('4', { message: 'category_id must be a valid UUID v4 format' })
  category_id!: string;

  @IsOptional()
  @IsNumber({}, { message: 'view_count must be a valid number' })
  @Min(0, { message: 'view_count cannot be negative' })
  view_count?: number;

  @IsOptional()
  @IsNumber({}, { message: 'add_to_cart_count must be a valid number' })
  @Min(0, { message: 'add_to_cart_count cannot be negative' })
  add_to_cart_count?: number;

  @IsOptional()
  @IsNumber({}, { message: 'purchase_count must be a valid number' })
  @Min(0, { message: 'purchase_count cannot be negative' })
  purchase_count?: number;

  @IsOptional()
  @IsNumber({}, { message: 'affinity_score must be a valid number' })
  affinity_score?: number;
}
