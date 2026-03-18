import { Injectable } from '@nestjs/common';
import { Repository, IsNull } from 'typeorm';
import { RefreshToken } from '../entities/refresh-token.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class RefreshTokenRepository {
  constructor(
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
  ) {}

  async createToken(userId: string, expiresAt: Date): Promise<RefreshToken> {
    const token = this.refreshTokenRepository.create({
      user_id: userId,
      expires_at: expiresAt,
    });

    return this.refreshTokenRepository.save(token);
  }

  async updateTokenHash(tokenId: string, tokenHash: string): Promise<void> {
    await this.refreshTokenRepository.update(tokenId, {
      token_hash: tokenHash,
    });
  }

  async findById(tokenId: string): Promise<RefreshToken | null> {
    return this.refreshTokenRepository.findOne({
      where: { id: tokenId },
    });
  }

  async findActiveTokensByUser(userId: string): Promise<RefreshToken[]> {
    return this.refreshTokenRepository.find({
      where: {
        user_id: userId,
        revoked_at: IsNull(),
      },
    });
  }

  async revokeToken(tokenId: string): Promise<void> {
    await this.refreshTokenRepository.update(tokenId, {
      revoked_at: new Date(),
    });
  }

  async revokeAllUserTokens(userId: string): Promise<void> {
    await this.refreshTokenRepository
      .createQueryBuilder()
      .update()
      .set({ revoked_at: new Date() })
      .where('user_id = :userId', { userId })
      .execute();
  }
}
