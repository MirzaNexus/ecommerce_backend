import {
  IsString,
  IsUUID,
  IsOptional,
  IsBoolean,
  IsEnum,
  IsNumber,
  IsArray,
  ValidateNested,
  Matches,
  IsUrl,
} from 'class-validator';
import { ProductStatus } from '../enums/product-status.enum';
import { Type } from 'class-transformer';
import { CreateVariantDto } from './variant/create-variant.dto';

export class CreateProductDto {
  @IsString({ message: 'Product name must be a string' })
  name!: string;

  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  description?: string;

  @IsUUID('4', { message: 'Invalid category ID format' })
  categoryId!: string;

  @IsOptional()
  @IsBoolean({ message: 'isPublished must be boolean' })
  isPublished?: boolean;

  @IsOptional()
  @IsEnum(ProductStatus, { message: 'Invalid product status' })
  status?: ProductStatus;

  @IsOptional()
  @IsNumber({}, { message: 'Base price must be a number' })
  basePrice?: number;

  @IsOptional()
  @IsString({ message: 'Slug must be a string' })
  @Matches(/^[a-z0-9-]+$/, {
    message: 'Slug must only contain lowercase letters, numbers, and dashes',
  })
  slug?: string;

  @IsUrl({}, { message: 'Image must be a valid URL' })
  imageUrl?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateVariantDto)
  variants: CreateVariantDto[];
}
