import {
  IsOptional,
  IsString,
  IsUUID,
  IsNumber,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';

export class GetBuyerProductsQueryDto {
  // --- Basic Search & Category ---
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsUUID()
  categoryId?: string;

  // --- Price Range (Standard for Buyer) ---
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  minPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  maxPrice?: number;

  // --- Variant Attributes (Mapped from VariantAttributesDto) ---
  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsString()
  size?: string;

  @IsOptional()
  @IsString()
  material?: string; // ✅ Added as per your request

  // --- Sorting & Pagination ---
  @IsOptional()
  @IsEnum(['price_asc', 'price_desc', 'newest', 'trending'])
  sortBy?: string = 'newest';

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number = 12; // Buyer page par 12 items standard hain (3x4 grid)
}
