import {
  IsBoolean,
  IsOptional,
  IsUUID,
  IsEnum,
  IsString,
  IsNumber,
} from 'class-validator';
import { ProductStatus } from '../enums/product-status.enum';
import { ProductResponseDto } from './productResponseDto';
import { Type } from 'class-transformer';

export class GetAllProductsQueryDto {
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @IsOptional()
  @IsEnum(ProductStatus)
  status?: ProductStatus;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number = 10;
}

export class PaginationMetaDto {
  total!: number;
  page!: number;
  limit!: number;
  totalPages!: number;
}

export class PaginatedProductsDto {
  data!: ProductResponseDto[];
  meta!: PaginationMetaDto;
}

export class ProductIdParamDto {
  @IsUUID('4', { message: 'Invalid product ID format' })
  id!: string;
}
