import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class LoginDTO {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  @MinLength(8)
  password: string;
}

export class RefreshTokenDTO {
  @IsNotEmpty()
  refreshToken: string;
}

export class LoginResponseDTO {
  accessToken: string;
  refreshToken: string;
}

export class AccessTokenResponseDTO {
  accessToken: string;
  refreshToken: string;
}

export class LogoutResponseDTO {
  message: string;
}
