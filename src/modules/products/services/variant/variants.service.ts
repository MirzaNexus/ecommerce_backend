import {
  Injectable,
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';

import { VariantRepository } from '../../repositories/variant.repository';
import { CreateVariantDto } from '../../dto/variant/create-variant.dto';
import { Variant } from '../../entities/variant.entity';
import { Product } from '../../entities/product.entity';
import { ProductRepository } from '../../repositories/product.repositry';

@Injectable()
export class VariantService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly variantRepo: VariantRepository,
    private readonly productRepo: ProductRepository,
  ) {}

  async createVariant(dto: CreateVariantDto) {
    const product = await this.productRepo.findById(dto.productId);

    if (!product) {
      throw new BadRequestException('Product does not exist');
    }

    if (dto.price < 0) {
      throw new BadRequestException('Price cannot be negative');
    }

    const existingSku = await this.variantRepo.existsBySku(dto.sku);
    if (existingSku) {
      throw new ConflictException('SKU already exists');
    }

    const variant = this.dataSource.manager.create(Variant, {
      ...dto,
      product,
    });

    const saved = await this.variantRepo.create(variant);

    return {
      message: 'Variant created successfully',
      data: saved,
    };
  }

  async updateVariant(id: string, dto: Partial<CreateVariantDto>) {
    return await this.dataSource.transaction(async (manager) => {
      const variant = await this.variantRepo.findById(id, manager);

      if (!variant) {
        throw new NotFoundException('Variant not found');
      }

      if (variant.deletedAt) {
        throw new BadRequestException('Variant has been deleted');
      }

      if (dto.sku) {
        const existing = await this.variantRepo.existsBySku(
          dto.sku,
          id,
          manager,
        );
        if (existing) {
          throw new ConflictException('SKU already exists');
        }
      }

      if (dto.price !== undefined && dto.price < 0) {
        throw new BadRequestException('Price cannot be negative');
      }

      const safeUpdate: Partial<Variant> = {
        ...(dto.sku && { sku: dto.sku }),
        ...(dto.price !== undefined && { price: dto.price }),
        ...(dto.attributes && { attributes: dto.attributes }),
      };

      await this.variantRepo.updatePartial(id, safeUpdate, manager);

      const updated = await this.variantRepo.findById(id, manager);

      return {
        message: 'Variant updated successfully',
        data: updated,
      };
    });
  }

  async deleteVariant(id: string) {
    return await this.dataSource.transaction(async (manager) => {
      const variant = await this.variantRepo.findById(id, manager);

      if (!variant) {
        throw new NotFoundException('Variant not found');
      }

      await this.variantRepo.softDelete(id, manager);

      return {
        message: 'Variant successfully moved to trash',
      };
    });
  }
}
