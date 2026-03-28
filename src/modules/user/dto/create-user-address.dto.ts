import {
  IsEnum,
  IsString,
  IsOptional,
  Length,
  IsBoolean,
} from 'class-validator';
import { AddressType } from '../entities/user-address.entity';

export class CreateAddressDto {
  @IsEnum(AddressType)
  type: AddressType;

  @IsString()
  @Length(3, 255)
  line1: string;

  @IsOptional()
  @IsString()
  @Length(0, 255)
  line2?: string;

  @IsString()
  @Length(2, 100)
  city: string;

  @IsOptional()
  @IsString()
  @Length(2, 100)
  state?: string;

  @IsOptional()
  @IsString()
  @Length(2, 20)
  postalCode?: string;

  @IsString()
  @Length(2, 100)
  country: string;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
