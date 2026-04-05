import {
  IsString,
  IsNumber,
  IsUUID,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

// Dimensions ke liye choti class
class DimensionsDto {
  @IsNumber({}, { message: 'Height must be a number' })
  height!: number;

  @IsNumber({}, { message: 'Width must be a number' })
  width!: number;

  @IsNumber({}, { message: 'Length must be a number' })
  length!: number;
}

export class VariantAttributesDto {
  @IsOptional()
  @IsString({ message: 'Color must be a string' })
  color?: string;

  @IsOptional()
  @IsString({ message: 'Size must be a string' })
  size?: string;

  @IsOptional()
  @IsString({ message: 'Material must be a string' })
  material?: string;

  @IsOptional()
  @IsString({ message: 'Weight must be a string' })
  weight?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => DimensionsDto) // Yeh zaroori hai nested validation ke liye
  dimensions?: DimensionsDto;
}

export class CreateVariantDto {
  @IsUUID('4', { message: 'Product ID must be a valid UUID' })
  productId!: string;

  @IsString({ message: 'SKU must be a string' })
  sku!: string;

  @IsNumber({}, { message: 'Price must be a number' })
  price!: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => VariantAttributesDto) // Is se attributes ke andar ki fields validate hongi
  attributes?: VariantAttributesDto;
}
