import {
  IsString,
  IsOptional,
  IsNotEmpty,
  IsPhoneNumber,
} from 'class-validator';

export class AddressSnapshotDto {
  @IsString()
  @IsNotEmpty({ message: 'Full name is required' })
  fullName!: string;

  @IsPhoneNumber(null!, { message: 'Invalid phone number format' })
  phone!: string;

  @IsString()
  @IsNotEmpty({ message: 'Address line 1 is required' })
  line1!: string;

  @IsOptional()
  @IsString()
  line2?: string;

  @IsString()
  @IsNotEmpty({ message: 'City is required' })
  city!: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsString()
  postalCode?: string;

  @IsString()
  @IsNotEmpty({ message: 'Country is required' })
  country!: string;
}
