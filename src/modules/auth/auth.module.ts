import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Credential } from './entities/credential.entity';
import { CredentialRepository } from './repositories/credential.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Credential])],
  controllers: [AuthController],
  providers: [AuthService, CredentialRepository],
  exports: [AuthService],
})
export class AuthModule {}
