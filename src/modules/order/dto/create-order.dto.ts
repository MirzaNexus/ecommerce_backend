import {
  IsUUID,
  IsOptional,
  IsArray,
  ValidateNested,
  ValidateIf,
  IsNotEmptyObject,
  IsString,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { AddressSnapshotDto } from './address-snapshot.dto';
import { CreateOrderItemDto } from './create-order-item.dto';

export class CreateOrderDto {
  @IsArray()
  @ArrayMinSize(1, { message: 'Order must have at least one item' })
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items!: CreateOrderItemDto[];

  @IsOptional()
  @IsUUID('4', {
    message: 'Please provide a valid address ID from your profile',
  })
  userAddressId?: string;

  /**
   * Logical Check: If userAddressId is NOT provided,
   * the manual addressSnapshot is REQUIRED.
   */
  @ValidateIf((o) => !o.userAddressId)
  @IsNotEmptyObject(
    {},
    { message: 'Please provide a shipping address or select a saved one' },
  )
  @ValidateNested()
  @Type(() => AddressSnapshotDto)
  addressSnapshot?: AddressSnapshotDto;

  @IsOptional()
  @IsString()
  idempotencyKey?: string;
}
