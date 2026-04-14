import { IsUUID, IsInt, Min, IsOptional } from 'class-validator';

export class CreateInventoryDto {
  @IsOptional()
  @IsUUID('4', { message: 'Variant ID must be valid UUID' })
  variantId?: string;

  @IsInt({ message: 'Stock must be an integer' })
  @Min(0, { message: 'Stock cannot be negative' })
  stock!: number;
}
