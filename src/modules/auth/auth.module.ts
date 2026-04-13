import { Module } from '@nestjs/common';
import { AuthService } from './services/auth.service';
import { AuthController } from './controller/auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Credential } from './entities/credential.entity';
import { CredentialRepository } from './repositories/credential.repository';
import { JwtTokenService } from './services/jwt-token.service/jwt-token.service.service';
import { UserModule } from '../user/user.module';
import { RefreshToken } from './entities/refresh-token.entity';
import { JwtModule } from '@nestjs/jwt';
import { RefreshTokenRepository } from './repositories/refresh-token.repository';
import { PasswordHashService } from './services/password-hash/password-hash.service';
import { forwardRef } from '@nestjs/common';
import { JwtStrategy } from './strategies/jwt-strategy';
@Module({
  imports: [
    TypeOrmModule.forFeature([Credential, RefreshToken]),
    JwtModule.register({
      secret: process.env.JWT_ACCESS_SECRET,
      signOptions: { expiresIn: '1d' },
    }),
    forwardRef(() => UserModule),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    CredentialRepository,
    JwtTokenService,
    RefreshTokenRepository,
    PasswordHashService,
    JwtStrategy,
  ],
  exports: [AuthService],
})
export class AuthModule {}
