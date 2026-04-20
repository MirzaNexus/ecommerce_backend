import { Injectable } from '@nestjs/common';
import { Repository, EntityManager, FindOptionsWhere, IsNull } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { GetBuyerProductsQueryDto } from '../dto/getBuyerProductQueryDto';
import { Product } from '../entities/product.entity';
import { GetAllProductsQueryDto } from '../dto/getAllProductsQueryDto';
import { ProductStatus } from '../enums/product-status.enum';

@Injectable()
export class ProductRepository {
  constructor(private readonly manager: EntityManager) {}

  private repo(manager?: EntityManager): Repository<Product> {
    return (manager ?? this.manager).getRepository(Product);
  }

  async create(product: Product, manager?: EntityManager): Promise<Product> {
    return await this.repo(manager).save(product);
  }

  async findById(
    id: string,
    manager?: EntityManager,
    relations: string[] = [],
  ): Promise<Product | null> {
    return await this.repo(manager).findOne({
      where: { id, deletedAt: IsNull() },
      relations: relations,
    });
  }

  async findBySlug(
    slug: string,
    manager?: EntityManager,
  ): Promise<Product | null> {
    return await this.repo(manager).findOne({
      where: { slug, deletedAt: IsNull() },
    });
  }

  async updatePartial(
    id: string,
    data: Partial<Product>,
    manager?: EntityManager,
  ): Promise<void> {
    await this.repo(manager).update({ id }, data);
  }

  async softDelete(id: string, manager?: EntityManager): Promise<void> {
    await this.repo(manager).update(
      { id },
      {
        status: ProductStatus.ARCHIVED,
        deletedAt: new Date(),
      },
    );
  }

  async existsByCategoryId(
    categoryId: string,
    manager?: EntityManager,
  ): Promise<boolean> {
    const count = await this.repo(manager).count({
      where: {
        categoryId,
        deletedAt: IsNull(), // ✅ always safe
      },
    });

    return count > 0;
  }

  async findAllAdmin(
    query: GetAllProductsQueryDto,
    manager?: EntityManager,
  ): Promise<[Product[], number]> {
    const qb = this.repo(manager)
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .where('product.deletedAt IS NULL');

    if (query.isPublished !== undefined) {
      qb.andWhere('product.isPublished = :isPublished', {
        isPublished: query.isPublished,
      });
    }

    if (query.categoryId) {
      qb.andWhere('product.categoryId = :categoryId', {
        categoryId: query.categoryId,
      });
    }

    if (query.status) {
      qb.andWhere('product.status = :status', {
        status: query.status,
      });
    }

    if (query.search) {
      qb.andWhere('LOWER(product.name) LIKE LOWER(:search)', {
        search: `%${query.search}%`,
      });
    }

    const page = query.page ?? 1;
    const limit = query.limit ?? 10;

    qb.skip((page - 1) * limit).take(limit);
    qb.orderBy('product.createdAt', 'DESC');

    return await qb.getManyAndCount();
  }

  async findWithDetails(
    id: string,
    manager?: EntityManager,
  ): Promise<Product | null> {
    return await this.repo(manager).findOne({
      where: { id, deletedAt: IsNull() },
      relations: ['category', 'variants', 'variants.inventory'],
    });
  }

  async updateStatus(
    id: string,
    status: ProductStatus,
    manager?: EntityManager,
  ): Promise<void> {
    await this.repo(manager).update({ id }, { status });
  }

  async findAllBuyer(
    query: GetBuyerProductsQueryDto,
    manager?: EntityManager,
  ): Promise<[Product[], number]> {
    const qb = this.repo(manager)
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      // Join variants taake hum unpar filter laga saken
      .innerJoinAndSelect('product.variants', 'variants')
      .where('product.status = :status', { status: ProductStatus.PUBLISHED })
      .andWhere('product.deletedAt IS NULL');

    if (query.color) {
      qb.andWhere("LOWER(variants.attributes->>'color') = LOWER(:color)", {
        color: query.color,
      });
    }
    if (query.size) {
      qb.andWhere("LOWER(variants.attributes->>'size') = LOWER(:size)", {
        size: query.size,
      });
    }
    if (query.material) {
      qb.andWhere(
        "LOWER(variants.attributes->>'material') = LOWER(:material)",
        { material: query.material },
      );
    }

    if (query.minPrice)
      qb.andWhere('variants.price >= :minPrice', { minPrice: query.minPrice });
    if (query.maxPrice)
      qb.andWhere('variants.price <= :maxPrice', { maxPrice: query.maxPrice });

    if (query.search) {
      qb.andWhere('(LOWER(product.name) LIKE LOWER(:search))', {
        search: `%${query.search}%`,
      });
    }

    // Sorting Logic (Agar frontend se sortBy aa raha ho)
    if (query.sortBy === 'price_asc') qb.orderBy('variants.price', 'ASC');
    else if (query.sortBy === 'price_desc')
      qb.orderBy('variants.price', 'DESC');
    else qb.orderBy('product.createdAt', 'DESC');

    const page = Math.max(query.page || 1, 1);
    const limit = Math.max(query.limit || 12, 1);
    qb.skip((page - 1) * limit).take(limit);

    return await qb.getManyAndCount();
  }
}
