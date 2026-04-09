import {
  Injectable,
  BadRequestException,
  ConflictException,
  NotFoundException,
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
import { Category } from '../entities/category.entity';
import { IsUUID } from 'class-validator';

@Injectable()
export class ProductService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly categoryRepo: CategoryRepository,
    private readonly productRepo: ProductRepository,
  ) {}

  async createProduct(dto: CreateProductDto): Promise<ProductResponseDto> {
    return await this.dataSource.transaction(async (manager) => {
      const category = await this.categoryRepo.findById(
        dto.categoryId,
        manager,
      );

      if (!category) {
        throw new BadRequestException('Category does not exist');
      }

      if (dto.basePrice !== undefined && dto.basePrice < 0) {
        throw new BadRequestException('Base price cannot be negative');
      }

      let slug = dto.slug ?? dto.name.toLowerCase().replace(/\s+/g, '-');

      const existingSlug = await this.productRepo.findBySlug(slug);
      if (existingSlug) {
        throw new ConflictException('Slug already exists');
      }

      const product = manager.create(Product, {
        ...dto,
        slug,
        isPublished: false,
      });

      const saved = await this.productRepo.create(product);

      return ProductResponseDto.fromEntity(saved);
    });
  }

  async updateProduct(
    id: string,
    dto: Partial<CreateProductDto>,
  ): Promise<ProductResponseDto> {
    const manager = this.dataSource.manager;
    const productRepo = new ProductRepository(manager);
    const categoryRepo = manager.getRepository(Category);

    const product = await productRepo.findById(id);

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (dto.categoryId) {
      const category = await categoryRepo.findOne({
        where: { id: dto.categoryId },
      });

      if (!category) {
        throw new BadRequestException('Invalid category');
      }
    }

    if (dto.basePrice !== undefined && dto.basePrice < 0) {
      throw new BadRequestException('Base price cannot be negative');
    }

    if (dto.slug) {
      const existing = await productRepo.findBySlug(dto.slug);
      if (existing && existing.id !== id) {
        throw new ConflictException('Slug already in use');
      }
    }

    const safeUpdate: Partial<Product> = {
      ...(dto.name && { name: dto.name }),
      ...(dto.description !== undefined && { description: dto.description }),
      ...(dto.categoryId && { categoryId: dto.categoryId }),
      ...(dto.basePrice !== undefined && { basePrice: dto.basePrice }),
      ...(dto.slug && { slug: dto.slug }),
      ...(dto.imageUrl && { imageUrl: dto.imageUrl }),
      ...(dto.status && { status: dto.status }),
    };

    await productRepo.updatePartial(id, safeUpdate);

    const updated = await productRepo.findById(id);

    return ProductResponseDto.fromEntity(updated!);
  }

  async getAllProductsAdmin(
    query: GetAllProductsQueryDto = {},
  ): Promise<PaginatedProductsDto> {
    const manager = this.dataSource.manager;
    const productRepo = new ProductRepository(manager);

    const [products, total] = await productRepo.findAllAdmin(query);

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
    const product = await this.productRepo.findById(id);

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (product.deletedAt) {
      throw new BadRequestException('Product has been deleted');
    }

    return ProductResponseDto.fromEntity(product);
  }

  async deleteProduct(id: string): Promise<{ message: string }> {
    const manager = this.dataSource.manager;
    const productRepo = new ProductRepository(manager);

    const product = await productRepo.findById(id);

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (product.deletedAt) {
      throw new BadRequestException('Product already deleted');
    }

    await productRepo.updatePartial(id, {
      deletedAt: new Date(),
    });

    return { message: 'Product deleted successfully' };
  }

  async togglePublish(id: string): Promise<ProductResponseDto> {
    const manager = this.dataSource.manager;
    const productRepo = new ProductRepository(manager);

    const product = await productRepo.findById(id);

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (product.deletedAt) {
      throw new BadRequestException('Cannot publish deleted product');
    }

    await productRepo.updatePartial(id, {
      isPublished: !product.isPublished,
    });

    const updated = await productRepo.findById(id);

    return ProductResponseDto.fromEntity(updated!);
  }
}
