import {
  IsEmail,
  IsOptional,
  IsString,
  MinLength,
  Length,
} from 'class-validator';

export class RegisterBuyerDto {
  @IsString()
  @Length(2, 100)
  firstName: string;

  @IsOptional()
  @IsString()
  @Length(2, 100)
  lastName?: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsString()
  @MinLength(8)
  password: string;
}
