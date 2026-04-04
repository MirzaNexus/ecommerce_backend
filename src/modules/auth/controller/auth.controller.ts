import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import {
  LoginResponseDTO,
  LoginDTO,
  LogoutResponseDTO,
  AccessTokenResponseDTO,
  RefreshTokenDTO,
} from '../dto/create-auth.dto';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guards';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() dto: LoginDTO): Promise<LoginResponseDTO> {
    return this.authService.login(dto);
  }

  @Post('refresh')
  async refreshToken(
    @Body() dto: RefreshTokenDTO,
  ): Promise<AccessTokenResponseDTO> {
    return this.authService.refreshToken(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Body() dto: RefreshTokenDTO): Promise<LogoutResponseDTO> {
    return this.authService.logout(dto);
  }
}

/** 
POST /auth/login
POST/auth/refresh
POST /auth/logout
*/
