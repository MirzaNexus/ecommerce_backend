import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { UserAddress } from '../entities/user-address.entity';

@Injectable()
export class AddressRepository {
  constructor(
    @InjectRepository(UserAddress)
    private repo: Repository<UserAddress>,
  ) {}

  async create(data: Partial<UserAddress>, manager?: EntityManager) {
    const repo = manager ? manager.getRepository(UserAddress) : this.repo;
    const entity = repo.create(data);
    return await repo.save(entity);
  }

  async findByUserId(userId: string, manager?: EntityManager) {
    const repo = manager ? manager.getRepository(UserAddress) : this.repo;
    return await repo.find({ where: { userId } });
  }

  async update(
    id: string,
    data: Partial<UserAddress>,
    manager?: EntityManager,
  ) {
    const repo = manager ? manager.getRepository(UserAddress) : this.repo;
    await repo.update(id, data);
    return await repo.findOne({ where: { id } });
  }

  async delete(id: string, manager?: EntityManager) {
    const repo = manager ? manager.getRepository(UserAddress) : this.repo;
    return await repo.delete(id);
  }

  async resetDefault(userId: string, manager?: EntityManager) {
    const repo = manager ? manager.getRepository(UserAddress) : this.repo;
    return repo.update({ userId }, { isDefault: false });
  }

  async setDefault(addressId: string, manager?: EntityManager) {
    const repo = manager ? manager.getRepository(UserAddress) : this.repo;
    return await repo.update(addressId, { isDefault: true });
  }

  async findOne(
    addressId: string,
    userId: string,
    manager?: EntityManager,
  ): Promise<UserAddress | null> {
    const repo = manager ? manager.getRepository(UserAddress) : this.repo;
    return await repo.findOne({
      where: { id: addressId, userId },
      relations: ['user'],
    });
  }
}
