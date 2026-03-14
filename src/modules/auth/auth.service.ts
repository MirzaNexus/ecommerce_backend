import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { EntityManager } from 'typeorm';
import { CredentialRepository } from './repositories/credential.repository';

@Injectable()
export class AuthService {
  constructor(private readonly credentialRepo: CredentialRepository) {}

  async createCredentials(
    manager: EntityManager,
    userId: string,
    password: string,
  ) {
    const passwordHash = await bcrypt.hash(password, 10);

    await this.credentialRepo.storeCredential(manager, userId, passwordHash);
  }
}
