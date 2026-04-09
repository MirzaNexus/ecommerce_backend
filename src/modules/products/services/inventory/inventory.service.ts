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
    manager?: EntityManager,
  ): Promise<Inventory> {
    return await this.dataSource.transaction(async (txnManager) => {
      const repoManager = manager ?? txnManager;

      if (dto.stock < 0)
        throw new BadRequestException('Stock cannot be negative');

      const inventory = repoManager.create(Inventory, {
        variantId: dto.variantId,
        stock: dto.stock,
      });

      return await this.inventoryRepo.create(inventory, repoManager);
    });
  }

  async updateStock(variantId: string, stock: number) {
    if (stock < 0) {
      throw new BadRequestException('Stock cannot be negative');
    }

    return await this.dataSource.transaction(async (manager) => {
      const inventory = await this.inventoryRepo.findByVariantId(
        variantId,
        manager,
      );

      if (!inventory) {
        throw new NotFoundException('Inventory not found');
      }

      // 🔥 Critical: row-level lock inside repo
      const updated = await this.inventoryRepo.updateStockWithLock(
        variantId,
        stock,
        manager,
      );

      if (!updated) {
        throw new ConflictException('Stock update failed due to concurrency');
      }

      return {
        message: 'Stock updated successfully',
      };
    });
  }
}
