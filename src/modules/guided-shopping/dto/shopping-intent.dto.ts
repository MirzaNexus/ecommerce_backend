import {
  IsUUID,
  IsString,
  IsOptional,
  IsNumber,
  IsArray,
  Min,
  Max,
  IsInt,
  ValidateNested,
} from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';
import { ShoppingFeaturesDto } from './sub-dto/shopping-features.dto';

export class CreateShoppingIntentDto {
  @IsUUID('4', { message: 'Session ID must be a valid UUID' })
  sessionId!: string;

  @IsOptional()
  @IsString({ message: 'Product Identifier must be a string' })
  productIdentifier?: string;

  @IsOptional()
  @IsUUID('4', {
    message: 'CategoryId must be a valid reference to the Categories table',
  })
  categoryId?: string;

  @IsOptional()
  @IsNumber({}, { message: 'Budget must be a numeric value' })
  @Min(0, { message: 'Budget cannot be negative' })
  budgetLimit?: number;

  @IsOptional()
  @IsArray({ message: 'Preferred brands must be an array of strings' })
  @IsString({ each: true, message: 'Each brand must be a string' })
  preferredBrands?: string[];

  @IsOptional()
  @ValidateNested()
  @Type(() => ShoppingFeaturesDto) // Replaced Record<string, any>
  features?: ShoppingFeaturesDto;

  @IsOptional()
  @IsNumber({}, { message: 'Confidence score must be a number' })
  @Min(0)
  @Max(1)
  extractionConfidence?: number;

  @IsOptional()
  @IsInt({ message: 'Version must be a whole number' })
  @Min(1, { message: 'Version must start from at least 1' })
  version?: number;
}

export class UpdateShoppingIntentDto extends PartialType(
  CreateShoppingIntentDto,
) {}
