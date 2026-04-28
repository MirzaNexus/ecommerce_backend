import {
  IsOptional,
  IsString,
  IsNumber,
  Min,
  ValidateNested,
} from 'class-validator';
import { plainToInstance, Transform, Type } from 'class-transformer';

export class UpdateDimensionsDto {
  @Transform(({ value }) => Number(value))
  @IsOptional()
  height?: number;

  @Transform(({ value }) => Number(value))
  @IsOptional()
  width?: number;

  @Transform(({ value }) => Number(value))
  @IsOptional()
  length?: number;
}

export class UpdateVariantAttributesDto {
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

  @Transform(({ value }) => Number(value))
  @IsOptional()
  @IsNumber()
  price?: number;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @Transform(({ value }) => Number(value))
  @IsNumber()
  @Min(0)
  @IsOptional()
  stock?: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateVariantAttributesDto)
  @Transform(({ value }) => {
    const parsed = typeof value === 'string' ? JSON.parse(value) : value;
    return plainToInstance(UpdateVariantAttributesDto, parsed);
  })
  attributes?: UpdateVariantAttributesDto;
}
