import { IsEmail, IsString, IsNotEmpty, MinLength } from 'class-validator';
import { UserRole } from 'src/modules/user/entities/user.entity';

export class LoginDTO {
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsNotEmpty()
  @MinLength(8)
  password!: string;

  @IsNotEmpty()
  @IsString()
  deviceId!: string;
}

export class RefreshTokenDTO {
  @IsNotEmpty()
  refreshToken!: string;
}

export class AuthUserDto {
  id!: string;
  email!: string;
  role!: UserRole; // ya enum ho to Role
}

export class LoginResponseDTO {
  success?: boolean;
  message?: string;
  accessToken!: string;
  refreshToken!: string;
  user!: AuthUserDto;
}

export class AccessTokenResponseDTO {
  accessToken!: string;
  refreshToken!: string;
}

export class LogoutResponseDTO {
  message!: string;
}
