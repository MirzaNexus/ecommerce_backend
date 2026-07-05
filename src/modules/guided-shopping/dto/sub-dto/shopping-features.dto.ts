import {
  IsString,
  IsOptional,
  IsObject,
  ValidateNested,
  IsNumber,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class DimensionsDto {
  @IsNumber() @Min(0) height!: number;
  @IsNumber() @Min(0) width!: number;
  @IsNumber() @Min(0) length!: number;
}

export class ShoppingFeaturesDto {
  @IsOptional() @IsString() color?: string;
  @IsOptional() @IsString() size?: string;
  @IsOptional() @IsString() brand?: string;
  @IsOptional() @IsString() material?: string;
  @IsOptional() @IsString() weight?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => DimensionsDto)
  dimensions?: DimensionsDto;

  @IsOptional() @IsString() style?: string;
  @IsOptional() @IsString() fit?: string;
  @IsOptional() @IsString() occasion?: string;

  @IsOptional()
  @IsObject()
  attributes?: Record<string, string | number | boolean>;
}
