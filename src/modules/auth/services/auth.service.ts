import {
  Injectable,
  Inject,
  forwardRef,
  UnauthorizedException,
} from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { CredentialRepository } from '../repositories/credential.repository';
import { PasswordHashService } from './password-hash/password-hash.service';
import { UserService } from 'src/modules/user/services/user.service';
import { JwtTokenService } from './jwt-token.service/jwt-token.service.service';
import { RefreshTokenRepository } from '../repositories/refresh-token.repository';
import {
  LoginDTO,
  LoginResponseDTO,
  RefreshTokenDTO,
  LogoutResponseDTO,
  AccessTokenResponseDTO,
} from '../dto/create-auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly credentialRepo: CredentialRepository,
    private readonly passwordService: PasswordHashService,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    private readonly jwtService: JwtTokenService,
    private readonly refreshTokenRepo: RefreshTokenRepository,
  ) {}

  async createCredentials(
    manager: EntityManager,
    userId: string,
    password: string,
  ) {
    const passwordHash = await this.passwordService.hashPassword(password);
    await this.credentialRepo.storeCredential(userId, passwordHash, manager);
  }

  async login(dto: LoginDTO): Promise<LoginResponseDTO> {
    const user = await this.userService.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const credential = await this.credentialRepo.findByUserId(user.id);
    if (!credential) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await this.passwordService.verifyPassword(
      dto.password,
      credential.passwordHash,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const existingToken = await this.refreshTokenRepo.findActiveByUserAndDevice(
      user.id,
      dto.deviceId,
    );

    if (existingToken) {
      throw new UnauthorizedException('Already logged in on this device');
    }

    const accessToken = await this.jwtService.generateAccessToken(
      user.id,
      user.email,
      user.role,
    );
    const refreshToken = await this.jwtService.generateRefreshToken(
      user.id,
      dto.deviceId,
    );

    return {
      success: true,
      message: 'User logged-In successfully',
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    };
  }

  async refreshToken(dto: RefreshTokenDTO): Promise<AccessTokenResponseDTO> {
    const payload = await this.jwtService.verifyRefreshToken(dto.refreshToken);
    const user = await this.userService.findById(payload.userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    const newRefreshToken = await this.jwtService.rotateRefreshToken(
      payload.userId,
      payload.tokenId,
      payload.device_id,
      payload.expiresAt,
    );
    const accessToken = await this.jwtService.generateAccessToken(
      user.id,
      user.email,
      user.role,
    );

    return {
      accessToken,
      refreshToken: newRefreshToken,
    };
  }

  async logout(dto: RefreshTokenDTO): Promise<LogoutResponseDTO> {
    const payload = await this.jwtService.verifyRefreshToken(dto.refreshToken);
    await this.jwtService.revokeToken(payload.tokenId);

    return {
      message: 'Logged out successfully',
    };
  }

  async logoutAllDevices(userId: string): Promise<LogoutResponseDTO> {
    await this.jwtService.revokeAllUserTokens(userId);

    return {
      message: 'Logged out from all devices successfully',
    };
  }
}
