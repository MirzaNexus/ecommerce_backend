import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { InventoryRepository } from '../../repositories/inventory.repository';
import { CreateInventoryDto } from '../../dto/inventory/create-inventory.dto';
import { Inventory } from '../../entities/inventory.entity';

@Injectable()
export class InventoryService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly inventoryRepo: InventoryRepository,
  ) {}

  async createInventory(
    dto: CreateInventoryDto,
    manager?: EntityManager, // Bahar se manager aa raha hai
  ): Promise<Inventory> {
    const m = manager ?? this.dataSource.manager;

    if (dto.stock < 0) {
      throw new BadRequestException('Stock cannot be negative');
    }

    const inventory = m.create(Inventory, {
      variantId: dto.variantId,
      stock: dto.stock,
    });

    return await this.inventoryRepo.create(inventory, m);
  }

  async updateStock(variantId: string, stock: number, manager?: EntityManager) {
    if (stock < 0) {
      throw new BadRequestException('Stock cannot be negative');
    }

    const runner = async (txnManager: EntityManager) => {
      const inventory = await this.inventoryRepo.findByVariantId(
        variantId,
        txnManager,
      );

      if (!inventory) {
        throw new NotFoundException('Inventory not found');
      }

      const updated = await this.inventoryRepo.updateStockWithLock(
        variantId,
        stock,
        txnManager,
      );

      if (!updated) {
        throw new ConflictException('Stock update failed due to concurrency');
      }

      return { message: 'Stock updated successfully' };
    };

    return manager
      ? await runner(manager)
      : await this.dataSource.transaction(runner);
  }

  async deleteInventoryByVariant(variantId: string, manager: EntityManager) {
    await this.inventoryRepo.softDeleteByVariantId(variantId, manager);
  }
}
