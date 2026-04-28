import { Injectable } from '@nestjs/common';
import { Repository, EntityManager, IsNull, In } from 'typeorm';
import { Variant } from '../entities/variant.entity';
import { Inventory } from '../entities/inventory.entity';

@Injectable()
export class VariantRepository {
  constructor(private readonly manager: EntityManager) {}

  private repo(manager?: EntityManager): Repository<Variant> {
    return (manager ?? this.manager).getRepository(Variant);
  }

  async create(variant: Variant, manager?: EntityManager): Promise<Variant> {
    return await this.repo(manager).save(variant);
  }

  async findById(
    id: string,
    manager?: EntityManager,
    relations: string[] = ['product'],
  ): Promise<Variant | null> {
    return await this.repo(manager).findOne({
      where: { id, deletedAt: IsNull() },
      relations: relations,
    });
  }

  async existsBySku(
    sku: string,
    excludeId?: string,
    manager?: EntityManager,
  ): Promise<boolean> {
    const qb = this.repo(manager)
      .createQueryBuilder('variant')
      .where('variant.sku = :sku', { sku })
      .andWhere('variant.deletedAt IS NULL');

    if (excludeId) {
      qb.andWhere('variant.id != :id', { id: excludeId });
    }

    const count = await qb.getCount();
    return count > 0;
  }

  async updatePartial(
    id: string,
    data: Partial<Variant>,
    manager?: EntityManager,
  ): Promise<void> {
    await this.repo(manager).update({ id }, data);
  }

  async softDelete(id: string, manager?: EntityManager): Promise<void> {
    await this.repo(manager).update(
      { id },
      {
        deletedAt: new Date(),
      },
    );
  }

  async findByProductId(
    productId: string,
    manager?: EntityManager,
  ): Promise<Variant[]> {
    return await this.repo(manager).find({
      where: {
        productId,
        deletedAt: IsNull(),
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findByIdForUpdate(id: string, manager: EntityManager) {
    return manager
      .getRepository(Variant) // Entity class ka naam
      .createQueryBuilder('variant') // Alias (aap kuch bhi rakh saktay hain, 'variant' standard hai)
      .setLock('pessimistic_write')
      .leftJoinAndSelect('variant.inventory', 'inventory') // 'variant' alias hai aur 'inventory' class property hai
      .where('variant.id = :id', { id })
      .getOne();
  }

  async findManyWithInventory(
    ids: string[],
    manager?: EntityManager,
  ): Promise<Variant[]> {
    return await this.repo(manager).find({
      where: { id: In(ids) },
      relations: ['inventory', 'product'],
    });
  }
}
