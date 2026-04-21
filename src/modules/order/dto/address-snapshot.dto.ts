import { IsString, IsOptional, IsNotEmpty } from 'class-validator';

export class AddressSnapshotDto {
  @IsString({ message: 'Full name must be a string' })
  @IsNotEmpty({ message: 'Full name is required' })
  fullName!: string;

  @IsString({ message: 'Phone must be a string' })
  @IsNotEmpty({ message: 'Phone number is required' })
  phone!: string;

  @IsString({ message: 'Address line1 must be a string' })
  @IsNotEmpty({ message: 'Address line1 is required' })
  line1!: string;

  @IsOptional()
  @IsString({ message: 'Address line2 must be a string' })
  line2?: string;

  @IsString({ message: 'City must be a string' })
  @IsNotEmpty({ message: 'City is required' })
  city!: string;

  @IsOptional()
  @IsString({ message: 'State must be a string' })
  state?: string;

  @IsOptional()
  @IsString({ message: 'Postal code must be a string' })
  postalCode?: string;

  @IsString({ message: 'Country must be a string' })
  @IsNotEmpty({ message: 'Country is required' })
  country!: string;
}
