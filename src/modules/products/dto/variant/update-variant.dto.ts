import {
  IsOptional,
  IsString,
  IsNumber,
  Min,
  ValidateNested,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

class UpdateDimensionsDto {
  @IsOptional()
  height?: number;

  @IsOptional()
  width?: number;

  @IsOptional()
  length?: number;
}

class UpdateVariantAttributesDto {
  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsString()
  size?: string;

  @IsOptional()
  @IsString()
  material?: string;

  @IsOptional()
  @IsString()
  weight?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateDimensionsDto)
  @Transform(({ value }) =>
    typeof value === 'string' ? JSON.parse(value) : value,
  )
  dimensions?: UpdateDimensionsDto;
}

export class UpdateVariantDto {
  @IsOptional()
  @IsString()
  sku?: string;

  @IsOptional()
  @IsNumber()
  price?: number;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  stock?: number = 0;

  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateVariantAttributesDto)
  @Transform(({ value }) =>
    typeof value === 'string' ? JSON.parse(value) : value,
  )
  attributes?: UpdateVariantAttributesDto;
}
