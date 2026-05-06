import {
  Injectable,
  BadRequestException,
  ConflictException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ProductRepository } from '../repositories/product.repositry';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { EntityManager } from 'typeorm';
import { Product } from '../entities/product.entity';
import { CategoryRepository } from '../repositories/category.repository';
import { ProductResponseDto } from '../dto/productResponseDto';
import { GetAllProductsQueryDto } from '../dto/getAllProductsQueryDto';
import { PaginatedProductsDto } from '../dto/getAllProductsQueryDto';
import { ProductStatus } from '../enums/product-status.enum';
import { VariantService } from './variant/variants.service';
import { CreateVariantDto } from '../dto/variant/create-variant.dto';
import { MediaService } from 'src/modules/media/media.service';
import { GetBuyerProductsQueryDto } from '../dto/getBuyerProductQueryDto';
import { PaginatedBuyerProductsDto } from '../dto/buyerProductResponseDto';
import { BuyerProductResponseDto } from '../dto/buyerProductResponseDto';
import { AlgoliaService } from 'src/modules/algolia/algolia.service';
import { ConfigService } from '@nestjs/config';
import { CreateShoppingIntentDto } from 'src/modules/guided-shopping/dto/shopping-intent.dto';

@Injectable()
export class ProductService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly categoryRepo: CategoryRepository,
    private readonly productRepo: ProductRepository,
    private readonly variantService: VariantService,
    private readonly mediaService: MediaService,
    private readonly algoliaService: AlgoliaService,
    private readonly configService: ConfigService,
  ) {}

  private async handleNestedCreation(
    productId: string,
    vDto: CreateVariantDto,
    manager: EntityManager,
    imageUrl?: string,
  ) {
    await this.variantService.createVariant(
      { ...vDto, productId, imageUrl },
      undefined,
      manager,
    );
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  async createProduct(
    dto: CreateProductDto,
    mainFile?: Express.Multer.File,
    variantFiles?: Express.Multer.File[],
  ): Promise<ProductResponseDto> {
    if (!mainFile) {
      throw new BadRequestException('Product main image is required');
    }

    if (!dto.variants || dto.variants.length === 0) {
      throw new BadRequestException('At least one variant is required');
    }

    const variantFilesCount = variantFiles?.length || 0;
    if (variantFilesCount !== dto.variants.length) {
      throw new BadRequestException(
        `Each variant must have an image. Expected ${dto.variants.length} images, but received ${variantFilesCount}.`,
      );
    }

    const productImageUrl = await this.mediaService.uploadImage(
      mainFile,
      'products',
    );
    const variantImageUrls: string[] = [];

    if (variantFiles?.length) {
      for (const file of variantFiles) {
        const url = await this.mediaService.uploadImage(file, 'variants');
        variantImageUrls.push(url);
      }
    }
    const finalProductDto = await this.dataSource.transaction(
      async (manager) => {
        const category = await this.categoryRepo.findById(
          dto.categoryId,
          manager,
        );
        if (!category) {
          throw new BadRequestException('Category does not exist');
        }
        const slug = dto.slug ?? this.generateSlug(dto.name);
        const existingProduct = await this.productRepo.findBySlug(
          slug,
          manager,
        );
        if (existingProduct) {
          throw new ConflictException('Product slug already exists');
        }

        const productEntity = manager.create(Product, {
          ...dto,
          slug,
          imageUrl: productImageUrl,
          isPublished: false,
        });
        const savedProduct = await this.productRepo.create(
          productEntity,
          manager,
        );

        if (dto.variants && dto.variants.length > 0) {
          for (let i = 0; i < dto.variants.length; i++) {
            await this.handleNestedCreation(
              savedProduct.id,
              dto.variants[i],
              manager,
              variantImageUrls[i],
            );
          }
        }

        const finalProduct = await this.productRepo.findById(
          savedProduct.id,
          manager,
          ['variants', 'variants.inventory', 'category'],
        );
        if (!finalProduct) {
          throw new InternalServerErrorException(
            'Product creation failed during final fetch',
          );
        }
        return ProductResponseDto.fromEntity(finalProduct!);
      },
    );

    try {
      const totalStock =
        finalProductDto.variants?.reduce((sum: number, variant: any) => {
          return sum + (variant.inventory?.stock || variant.stock || 0);
        }, 0) || 0;
      // Algolia expects a specific format. Hum response DTO se data nikal kar bhejenge.
      await this.algoliaService.saveObject(
        this.configService.get<string>('ALGOLIA_INDEX_NAME') || 'poducts_index',
        {
          objectID: finalProductDto.id, // Database ID as Algolia Object ID (Idempotency)
          name: finalProductDto.name,
          basePrice: finalProductDto.basePrice,
          imageUrl: finalProductDto.imageUrl,
          category: finalProductDto.categoryName,
          category_id: finalProductDto.categoryId, // Make sure DTO has this
          isPublished: finalProductDto.isPublished,
          stock: totalStock,
        },
      );

      console.log(`✅ Product ${finalProductDto.name} synced to Algolia`);
    } catch (error) {
      console.error(
        `❌ Algolia Sync Failed for Product ${finalProductDto.name}:`,
        error,
      );
    }

    return finalProductDto;
  }

  async updateProduct(
    id: string,
    dto: UpdateProductDto,
    file?: Express.Multer.File,
  ): Promise<ProductResponseDto> {
    let uploadedImageUrl: string | undefined;
    if (file) {
      uploadedImageUrl = await this.mediaService.uploadImage(file, 'products');
    }
    const updatedProductDto = await this.dataSource.transaction(
      async (manager) => {
        const product = await this.productRepo.findById(id, manager);
        if (!product) {
          throw new NotFoundException('Product not found');
        }
        if (dto.categoryId) {
          const category = await this.categoryRepo.findById(
            dto.categoryId,
            manager,
          );
          if (!category) throw new BadRequestException('Invalid category');
        }

        let finalSlug = dto.slug;

        if (dto.name && !dto.slug) {
          finalSlug = this.generateSlug(dto.name);
        }

        if (finalSlug) {
          const existing = await this.productRepo.findBySlug(
            finalSlug,
            manager,
          );
          if (existing && existing.id !== id) {
            throw new ConflictException(`Slug '${finalSlug}' already in use`);
          }
        }

        const safeUpdate: Partial<Product> = {
          ...(dto.name && { name: dto.name }),
          ...(dto.description !== undefined && {
            description: dto.description,
          }),
          ...(dto.categoryId && { categoryId: dto.categoryId }),
          ...(dto.basePrice !== undefined && { basePrice: dto.basePrice }),
          ...(finalSlug && { slug: finalSlug }),
          imageUrl: uploadedImageUrl || dto.imageUrl || product.imageUrl,
          ...(dto.status && { status: dto.status }),
          updatedAt: new Date(),
        };

        await this.productRepo.updatePartial(id, safeUpdate, manager);

        const updatedProduct = await this.productRepo.findById(id, manager, [
          'category',
          'variants',
          'variants.inventory',
        ]);
        return ProductResponseDto.fromEntity(updatedProduct!);
      },
    );

    try {
      const totalStock =
        updatedProductDto.variants?.reduce((sum: number, variant: any) => {
          return sum + (variant.inventory?.stock || variant.stock || 0);
        }, 0) || 0;

      await this.algoliaService.saveObject(
        this.configService.get<string>('ALGOLIA_INDEX_NAME') ||
          'products_index',
        {
          objectID: updatedProductDto.id, // Database ID as Algolia Object ID (Idempotency)
          name: updatedProductDto.name,
          basePrice: updatedProductDto.basePrice,
          imageUrl: updatedProductDto.imageUrl,
          category: updatedProductDto.categoryName,
          category_id: updatedProductDto.categoryId, // Make sure DTO has this
          isPublished: updatedProductDto.isPublished,
          stock: totalStock,
        },
      );

      console.log(`✅ Product ${updatedProductDto.name} synced to Algolia`);
    } catch (error) {
      console.error(
        `❌ Algolia Sync Failed for Product ${updatedProductDto.name}:`,
        error,
      );
    }

    return updatedProductDto;
  }

  async getAllProductsAdmin(
    query: GetAllProductsQueryDto = {},
  ): Promise<PaginatedProductsDto> {
    const [products, total] = await this.productRepo.findAllAdmin(query);

    const page = query.page ?? 1;
    const limit = query.limit ?? 10;

    return {
      data: products.map((p) => ProductResponseDto.fromEntity(p)),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getProductById(id: string): Promise<ProductResponseDto> {
    const product = await this.productRepo.findWithDetails(id);

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (product.deletedAt) {
      throw new BadRequestException('Product has been deleted');
    }

    return ProductResponseDto.fromEntity(product);
  }

  async deleteProduct(id: string): Promise<{ message: string }> {
    const result = await this.dataSource.transaction(async (manager) => {
      const product = await this.productRepo.findById(id, manager, [
        'variants',
      ]);
      if (!product) throw new NotFoundException('Product not found');
      if (product.variants && product.variants.length > 0) {
        for (const variant of product.variants) {
          await this.variantService.deleteVariant(variant.id, manager);
        }
      }

      await this.productRepo.softDelete(id, manager);

      return { message: 'Product and all associated data moved to trash' };
    });
    try {
      await this.algoliaService.deleteObject(
        this.configService.get<string>('ALGOLIA_INDEX_NAME') || '',
        id,
      );

      console.log(`🗑️ Product removed from Algolia index`);
    } catch (error) {
      console.error(`⚠️ Failed to remove Product from Algolia:`, error);
    }
    return result;
  }

  async toggleStatus(id: string): Promise<ProductResponseDto> {
    const updatedProductDto = await this.dataSource.transaction(
      async (manager) => {
        const product = await this.productRepo.findById(id, manager);

        if (!product) throw new NotFoundException('Product not found');
        if (product.status === ProductStatus.ARCHIVED) {
          throw new BadRequestException(
            'Cannot toggle status of an archived product',
          );
        }

        const newStatus =
          product.status === ProductStatus.DRAFT
            ? ProductStatus.PUBLISHED
            : ProductStatus.DRAFT;

        const isPublished = newStatus === ProductStatus.PUBLISHED;

        await this.productRepo.updatePartial(
          id,
          {
            status: newStatus,
            isPublished: isPublished,
          },
          manager,
        );
        const updatedProduct = await this.productRepo.findById(id, manager, [
          'category',
          'variants',
          'variants.inventory',
        ]);
        return ProductResponseDto.fromEntity(updatedProduct!);
      },
    );

    try {
      // Wahi stock calculation logic jo humne Indexer mein discuss kiya tha
      const totalStock =
        updatedProductDto.variants?.reduce((sum: number, variant: any) => {
          return sum + (variant.inventory?.stock || variant.stock || 0);
        }, 0) || 0;

      await this.algoliaService.saveObject(
        this.configService.get<string>('ALGOLIA_INDEX_NAME') ||
          'products_index',
        {
          objectID: updatedProductDto.id,
          name: updatedProductDto.name,
          basePrice: updatedProductDto.basePrice,
          category: updatedProductDto.categoryName,
          category_id: updatedProductDto.categoryId,
          imageUrl: updatedProductDto.imageUrl,
          isPublished: updatedProductDto.isPublished,
          stock: totalStock,
        },
      );

      console.log(
        `🔄 Algolia Sync: ${updatedProductDto.name} is now ${updatedProductDto.status}`,
      );
    } catch (error) {
      console.error(`❌ Algolia Toggle Sync Failed:`, error);
    }
    return updatedProductDto;
  }

  async archiveProduct(id: string): Promise<{ message: string }> {
    return await this.dataSource.transaction(async (manager) => {
      const product = await this.productRepo.findById(id, manager);
      if (!product) throw new NotFoundException('Product not found');

      await this.productRepo.softDelete(id, manager);

      return { message: 'Product moved to archive successfully' };
    });
  }

  async getAllProductsBuyer(
    query: GetBuyerProductsQueryDto = {},
  ): Promise<PaginatedBuyerProductsDto> {
    const [products, total] = await this.productRepo.findAllBuyer(query);
    return {
      data: products.map((p) => BuyerProductResponseDto.fromEntity(p, query)),
      meta: {
        total,
        page: query.page ?? 1,
        limit: query.limit ?? 12,
        totalPages: Math.ceil(total / (query.limit ?? 12)),
      },
    };
  }

  async findById(id: string, manager?: EntityManager) {
    return this.productRepo.findById(id, manager, [
      'variants',
      'variants.inventory',
    ]);
  }

  async getProductsForHydration(ids: string[]): Promise<Product[]> {
    return this.productRepo.findByIdsWithDetails(ids);
  }

  async getRelatedByCategory(
    categoryId: string,
    excludeId: string,
    limit: number = 4,
    offset: number = 0, // Offset helps the carousel move to the next set
  ) {
    return await this.productRepo.findRelatedByCategory(
      categoryId,
      excludeId,
      limit,
      offset,
    );
  }

  async findAllForRecommendationSync(
    manager?: EntityManager,
  ): Promise<Product[]> {
    return await this.productRepo.findAllActive(manager, [
      'variants',
      'variants.inventory',
    ]);
  }

  async getProductsByIntent(
    intent: CreateShoppingIntentDto,
  ): Promise<Product[]> {
    return await this.productRepo.searchByIntent(intent);
  }

  async getInquiryData(identifier: string) {
    return await this.productRepo.findByInquiry(identifier);
  }
}
