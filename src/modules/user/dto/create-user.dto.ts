import {
  IsEmail,
  IsOptional,
  IsString,
  MinLength,
  Length,
  IsNotEmpty,
} from 'class-validator';

export class RegisterBuyerDto {
  @IsString()
  @Length(2, 100)
  @IsNotEmpty({ message: 'First name is required' })
  firstName!: string;

  @IsOptional()
  @IsString()
  @Length(2, 100)
  lastName?: string;

  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Invalid email format' })
  email!: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsNotEmpty({ message: 'Password is required' })
  @IsString()
  @MinLength(8)
  password!: string;
}
