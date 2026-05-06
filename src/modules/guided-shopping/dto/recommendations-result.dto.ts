import {
  IsUUID,
  IsNumber,
  IsString,
  IsNotEmpty,
  Min,
  Max,
  IsOptional,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateRecommendedProductDto {
  @IsUUID('4', { message: 'Product ID must be a valid UUID' })
  productId!: string;

  @IsNumber({}, { message: 'Ranking score must be a number' })
  @Min(0)
  @Max(100)
  rankingScore!: number;

  @IsString({ message: 'Reasoning must be provided' })
  @IsNotEmpty({ message: 'Reasoning cannot be empty' })
  reasoning!: string;
}

export class CreateRecommendationSessionDto {
  @IsUUID('4', { message: 'Chat Session ID must be a valid UUID' })
  sessionId!: string;

  @IsOptional()
  @IsString({ message: 'Zero result reason must be a string' })
  zeroResultReason?: string;

  @IsArray({ message: 'Recommended products must be an array' })
  @ValidateNested({ each: true })
  @Type(() => CreateRecommendedProductDto)
  products!: CreateRecommendedProductDto[];
}
