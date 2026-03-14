import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { Credential } from '../entities/credential.entity';

@Injectable()
export class CredentialRepository {
  async storeCredential(
    manager: EntityManager,
    userId: string,
    passwordHash: string,
  ) {
    const credential = manager.create(Credential, {
      userId,
      passwordHash,
    });

    return manager.save(Credential, credential);
  }
}
