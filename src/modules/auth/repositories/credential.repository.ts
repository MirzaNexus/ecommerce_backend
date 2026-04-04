import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { Credential } from '../entities/credential.entity';

@Injectable()
export class CredentialRepository {
  constructor(
    @InjectRepository(Credential)
    private readonly credentialRepo: Repository<Credential>,
  ) {}

  private getRepo(manager?: EntityManager): Repository<Credential> {
    return manager ? manager.getRepository(Credential) : this.credentialRepo;
  }

  async storeCredential(
    userId: string,
    passwordHash: string,
    manager?: EntityManager,
  ): Promise<Credential> {
    const repo = this.getRepo(manager);

    const credential = repo.create({
      userId,
      passwordHash,
    });

    return repo.save(credential);
  }

  async findByUserId(
    userId: string,
    manager?: EntityManager,
  ): Promise<Credential | null> {
    const repo = this.getRepo(manager);

    return repo.findOne({
      where: { userId },
    });
  }

  async updatePassword(
    userId: string,
    passwordHash: string,
    manager?: EntityManager,
  ): Promise<void> {
    const repo = this.getRepo(manager);

    await repo.update(
      { userId },
      {
        passwordHash,
      },
    );
  }
}
