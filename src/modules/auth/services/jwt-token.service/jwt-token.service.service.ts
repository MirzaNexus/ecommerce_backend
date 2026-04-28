import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RefreshTokenRepository } from '../../repositories/refresh-token.repository';
import * as bcrypt from 'bcrypt';

@Injectable()
export class JwtTokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly refreshTokenRepo: RefreshTokenRepository,
  ) {}

  /*
  ACCESS TOKEN
  */

  async generateAccessToken(
    userId: string,
    email: string,
    role: string,
  ): Promise<string> {
    const payload = {
      userId,
      email,
      role,
    };

    return this.jwtService.sign(payload, {
      secret: process.env.JWT_ACCESS_SECRET,
      expiresIn: '1d',
    });
  }

  //REFRESH TOKEN

  async generateRefreshToken(
    userId: string,
    deviceId: string,
    sessionExpiresAt?: Date,
  ): Promise<string> {
    const expiresAt =
      sessionExpiresAt || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    const tokenEntity = await this.refreshTokenRepo.createToken(
      userId,
      deviceId,
      '',
      expiresAt,
    );

    const payload = {
      userId,
      tokenId: tokenEntity.id,
    };

    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: '30d',
    });

    const tokenHash = await bcrypt.hash(refreshToken, 10);

    await this.refreshTokenRepo.updateTokenHash(tokenEntity.id, tokenHash);

    return refreshToken;
  }

  /*
  VERIFY ACCESS TOKEN
  */

  async verifyAccessToken(token: string) {
    return this.jwtService.verify(token, {
      secret: process.env.JWT_ACCESS_SECRET,
    });
  }

  /*
  VERIFY REFRESH TOKEN
  */

  async verifyRefreshToken(refreshToken: string) {
    const payload = this.jwtService.verify(refreshToken, {
      secret: process.env.JWT_REFRESH_SECRET,
    });

    const token = await this.refreshTokenRepo.findById(payload.tokenId);

    if (!token) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (token.revoked_at) {
      throw new UnauthorizedException('Token revoked');
    }

    if (new Date() > token.expires_at) {
      throw new UnauthorizedException('Refresh token expired');
    }

    const isMatch = await bcrypt.compare(refreshToken, token.token_hash);

    if (!isMatch) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    return {
      userId: payload.userId,
      tokenId: payload.tokenId,
      device_id: token.device_id,
      expiresAt: token.expires_at,
    };
  }

  async rotateRefreshToken(
    userId: string,
    oldTokenId: string,
    device_id: string,
    sessionExpiresAt: Date,
  ): Promise<string> {
    await this.refreshTokenRepo.revokeToken(oldTokenId);

    return this.generateRefreshToken(userId, device_id, sessionExpiresAt);
  }

  /*
  LOGOUT SINGLE DEVICE
  */

  async revokeToken(tokenId: string) {
    await this.refreshTokenRepo.revokeToken(tokenId);
  }

  /*
  LOGOUT ALL DEVICES
  */

  async revokeAllUserTokens(userId: string) {
    await this.refreshTokenRepo.revokeAllUserTokens(userId);
  }
}
