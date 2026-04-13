import {
  IsString,
  IsNumber,
  Min,
  IsUUID,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

// Dimensions ke liye choti class
class DimensionsDto {
  @Transform(({ value }) => Number(value))
  @IsNumber({}, { message: 'Height must be a number' })
  height!: number;

  @Transform(({ value }) => Number(value))
  @IsNumber({}, { message: 'Width must be a number' })
  width!: number;

  @Transform(({ value }) => Number(value))
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
  @Type(() => DimensionsDto)
  @Transform(({ value }) =>
    typeof value === 'string' ? JSON.parse(value) : value,
  )
  dimensions?: DimensionsDto;
}

export class CreateVariantDto {
  @IsUUID('4', { message: 'Product ID must be a valid UUID' })
  productId!: string;

  @IsString({ message: 'SKU must be a string' })
  sku!: string;

  @Transform(({ value }) => Number(value))
  @IsNumber({}, { message: 'Price must be a number' })
  price!: number;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @Transform(({ value }) => Number(value))
  @IsNumber()
  @Min(0)
  @IsOptional()
  stock: number = 0;

  @IsOptional()
  @ValidateNested()
  @Type(() => VariantAttributesDto) // Is se attributes ke andar ki fields validate hongi
  @Transform(({ value }) =>
    typeof value === 'string' ? JSON.parse(value) : value,
  )
  attributes?: VariantAttributesDto;
}
