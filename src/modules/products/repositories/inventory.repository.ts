import { Injectable } from '@nestjs/common';
import { Repository, EntityManager, IsNull } from 'typeorm';
import { Inventory } from '../entities/inventory.entity';

@Injectable()
export class InventoryRepository {
  constructor(private readonly manager: EntityManager) {}

  private repo(manager?: EntityManager): Repository<Inventory> {
    return (manager ?? this.manager).getRepository(Inventory);
  }

  async findByVariantId(
    variantId: string,
    manager?: EntityManager,
  ): Promise<Inventory | null> {
    return await this.repo(manager).findOne({
      where: {
        variantId,
      },
    });
  }

  async updateStockWithLock(
    variantId: string,
    stock: number,
    manager?: EntityManager,
  ): Promise<Inventory | null> {
    const qb = this.repo(manager)
      .createQueryBuilder('inventory')
      .setLock('pessimistic_write')
      .where('inventory.variantId = :variantId', { variantId })
      .andWhere('inventory.deletedAt IS NULL');

    const inventory = await qb.getOne();

    if (!inventory) return null;

    inventory.stock = stock;

    return await this.repo(manager).save(inventory);
  }

  async create(
    inventory: Inventory,
    manager?: EntityManager,
  ): Promise<Inventory> {
    return await this.repo(manager).save(inventory);
  }

  async softDeleteByVariantId(
    variantId: string,
    manager?: EntityManager,
  ): Promise<void> {
    await this.repo(manager).update({ variantId }, { deletedAt: new Date() });
  }

  async decrementStock(
    variantId: string,
    quantity: number,
    manager: EntityManager,
  ): Promise<void> {
    await manager
      .getRepository(Inventory)
      .decrement({ variantId }, 'stock', quantity);
  }

  async incrementStock(
    variantId: string,
    quantity: number,
    manager: EntityManager,
  ): Promise<void> {
    await manager
      .getRepository(Inventory)
      .increment({ variantId }, 'stock', quantity); // Ensure 'stock' column name is correct
  }
}
