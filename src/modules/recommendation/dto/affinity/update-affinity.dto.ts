import { PartialType } from '@nestjs/mapped-types';
import { CreateUserCategoryAffinityDto } from './create-affinity.dto';
import { IsOptional, IsNumber, Min } from 'class-validator';

export class UpdateUserCategoryAffinityDto extends PartialType(
  CreateUserCategoryAffinityDto,
) {
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
