import {
  Injectable,
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { deepMerge } from '../../utils/normalizeAttributes';
import { VariantRepository } from '../../repositories/variant.repository';
import { CreateVariantDto } from '../../dto/variant/create-variant.dto';
import { Variant } from '../../entities/variant.entity';
import { ProductRepository } from '../../repositories/product.repositry';
import { UpdateVariantDto } from '../../dto/variant/update-variant.dto';
import { InventoryService } from '../inventory/inventory.service';
import { MediaService } from 'src/modules/media/media.service';
import { VariantResponseDto } from '../../dto/variant/variant.response.dto';

@Injectable()
export class VariantService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly variantRepo: VariantRepository,
    private readonly productRepo: ProductRepository,
    private readonly inventoryService: InventoryService,
    private readonly mediaService: MediaService,
  ) {}

  async createVariant(
    dto: CreateVariantDto,
    file?: Express.Multer.File,
    manager?: EntityManager,
  ) {
    let uploadedImageUrl = dto.imageUrl;
    if (!file) {
      throw new BadRequestException('Variant image is required');
    }
    uploadedImageUrl = await this.mediaService.uploadImage(file, 'variants');

    const executeLogic = async (m: EntityManager) => {
      if (!dto.productId) {
        throw new BadRequestException(
          'Product ID is required for variant creation',
        );
      }
      const product = await this.productRepo.findById(dto.productId, m);
      if (!product) {
        throw new BadRequestException('Product does not exist');
      }

      // Validation
      if (dto.price < 0) {
        throw new BadRequestException('Price cannot be negative');
      }

      const existingSku = await this.variantRepo.existsBySku(
        dto.sku,
        undefined,
        m,
      );
      if (existingSku) {
        throw new ConflictException('SKU already exists');
      }

      // 3. Variant Entity Creation
      const variant = m.create(Variant, {
        ...dto,
        product,
        imageUrl: uploadedImageUrl,
        attributes: dto.attributes,
        updatedAt: new Date(),
      });

      const saved = await this.variantRepo.create(variant, m);

      await this.inventoryService.createInventory(
        { variantId: saved.id, stock: dto.stock ?? 0 },
        m,
      );

      const finalVariant = await this.variantRepo.findById(saved.id, m, [
        'inventory',
      ]);

      return {
        message: 'Variant created successfully',
        data: VariantResponseDto.fromEntity(finalVariant!),
      };
    };

    if (manager) {
      return await executeLogic(manager);
    } else {
      return await this.dataSource.transaction(async (newManager) => {
        return await executeLogic(newManager);
      });
    }
  }

  async updateVariant(
    id: string,
    dto: UpdateVariantDto,
    file?: Express.Multer.File,
  ) {
    let uploadedImageUrl: string | undefined;
    if (file) {
      uploadedImageUrl = await this.mediaService.uploadImage(file, 'variants');
    }

    return await this.dataSource.transaction(async (manager) => {
      const variant = await this.variantRepo.findById(id, manager);
      if (!variant || variant.deletedAt) {
        throw new NotFoundException('Variant not found or has been deleted');
      }

      if (dto.sku && dto.sku !== variant.sku) {
        const existing = await this.variantRepo.existsBySku(
          dto.sku,
          id,
          manager,
        );
        if (existing) throw new ConflictException('SKU already exists');
      }

      if (dto.price !== undefined && dto.price < 0) {
        throw new BadRequestException('Price cannot be negative');
      }

      const mergedAttributes = dto.attributes
        ? deepMerge(variant.attributes, dto.attributes)
        : variant.attributes;

      const updatedEntity: Variant = {
        ...variant,
        ...(dto.sku !== undefined && { sku: dto.sku }),
        ...(dto.price !== undefined && { price: dto.price }),
        attributes: mergedAttributes,
        imageUrl: uploadedImageUrl || dto.imageUrl || variant.imageUrl,
      };
      await this.variantRepo.create(updatedEntity, manager); // Using save for partial update

      if (dto.stock !== undefined && dto.stock !== null) {
        await this.inventoryService.updateStock(id, dto.stock, manager);
      }

      const updated = await this.variantRepo.findById(id, manager, [
        'inventory',
      ]);
      return {
        message: 'Variant and inventory updated successfully',
        data: VariantResponseDto.fromEntity(updated!),
      };
    });
  }

  async deleteVariant(id: string, manager?: EntityManager) {
    const m = manager ?? this.dataSource.manager;

    const runner = async (txnManager: EntityManager) => {
      const variant = await this.variantRepo.findById(id, txnManager);
      if (!variant) throw new NotFoundException('Variant not found');

      await this.inventoryService.deleteInventoryByVariant(id, txnManager);

      await this.variantRepo.softDelete(id, txnManager);

      return { message: 'Variant and its inventory moved to trash' };
    };

    return manager
      ? await runner(manager)
      : await this.dataSource.transaction(runner);
  }
}
