import { IsUUID, IsInt, Min } from 'class-validator';

export class CreateOrderItemDto {
  @IsUUID('4', { message: 'Invalid variant selection' })
  productVariantId!: string;

  @IsInt()
  @Min(1, { message: 'Quantity must be at least 1' })
  quantity!: number;
}
