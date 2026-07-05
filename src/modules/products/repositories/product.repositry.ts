import { Injectable } from '@nestjs/common';
import {
  Repository,
  EntityManager,
  FindOptionsWhere,
  IsNull,
  Not,
  In,
  ILike,
} from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { GetBuyerProductsQueryDto } from '../dto/getBuyerProductQueryDto';
import { Product } from '../entities/product.entity';
import { GetAllProductsQueryDto } from '../dto/getAllProductsQueryDto';
import { ProductStatus } from '../enums/product-status.enum';
import { CreateShoppingIntentDto } from 'src/modules/guided-shopping/dto/shopping-intent.dto';

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

  async findByIdsWithDetails(
    ids: string[],
    manager?: EntityManager,
  ): Promise<Product[]> {
    if (ids.length === 0) return [];

    return this.repo(manager).find({
      where: { id: In(ids) },
      relations: ['variants', 'variants.inventory', 'category'],
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
      .innerJoinAndSelect('product.variants', 'variants')
      .leftJoin(
        'order_items',
        'orderItems',
        'orderItems.productVariantId = variants.id',
      )
      .leftJoin('orders', 'parentOrder', 'orderItems.orderId = parentOrder.id')
      .where('product.status = :status', { status: ProductStatus.PUBLISHED })
      .andWhere('product.deletedAt IS NULL');
    if (query.categoryId) {
      qb.andWhere(
        '(product.categoryId = :categoryId OR category.parentId = :categoryId)',
        { categoryId: query.categoryId },
      );
    }

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
    else if (query.sortBy === 'trending') {
      qb.addSelect('SUM(COALESCE(orderItems.quantity, 0))', 'total_sales') // Alias 'total_sales' define kiya
        .groupBy('product.id')
        .addGroupBy('variants.id')
        .addGroupBy('category.id')
        .orderBy('total_sales', 'DESC')
        .addOrderBy('product.createdAt', 'DESC');
    } else qb.orderBy('product.createdAt', 'DESC');

    const page = Math.max(query.page || 1, 1);
    const limit = Math.max(query.limit || 12, 1);
    qb.skip((page - 1) * limit).take(limit);

    return await qb.getManyAndCount();
  }

  async findRelatedByCategory(
    categoryId: string,
    excludeId: string,
    limit: number,
    offset: number,
    manager?: EntityManager,
  ): Promise<[Product[], number]> {
    return await this.repo(manager).findAndCount({
      where: {
        category: { id: categoryId },
        id: Not(excludeId), // Don't recommend the product currently being viewed
        deletedAt: IsNull(),
      },
      relations: ['category'], // Add any relations your frontend needs (e.g., 'images')
      take: limit, // How many to fetch
      skip: offset, // How many to skip
      order: {
        createdAt: 'DESC', // Newest products first
      },
    });
  }

  async findAllActive(
    manager?: EntityManager,
    relations: string[] = [],
  ): Promise<Product[]> {
    const repo = manager ? manager.getRepository(Product) : this.repo();

    return await repo.find({
      where: {
        isPublished: true,
        deletedAt: IsNull(), // Ensure soft-deleted products aren't synced
      },
      relations: relations,
    });
  }

  // async searchByIntent(
  //   intent: CreateShoppingIntentDto,
  //   manager?: EntityManager,
  // ): Promise<Product[]> {
  //   const query = this.repo(manager)
  //     .createQueryBuilder('product')
  //     .leftJoinAndSelect('product.variants', 'variant')
  //     .leftJoinAndSelect('variant.inventory', 'inventory')
  //     .where('product.isPublished = :published', { published: true })
  //     .andWhere('product.status = :status', { status: ProductStatus.PUBLISHED })
  //     .andWhere('inventory.stock > :minStock', { minStock: 0 });

  //   if (intent.categoryId) {
  //     query.andWhere('product.categoryId = :catId', {
  //       catId: intent.categoryId,
  //     });
  //   }

  //   if (intent.budgetLimit) {
  //     query.andWhere('variant.price <= :maxPrice', {
  //       maxPrice: intent.budgetLimit,
  //     });
  //   }

  //   if (intent.features) {
  //     Object.entries(intent.features).forEach(([key, value]) => {
  //       if (
  //         value &&
  //         typeof value === 'string' &&
  //         value !== 'NOT_SPECIFIED' &&
  //         key !== 'attributes'
  //       ) {
  //         query.andWhere(`variant.attributes->>'${key}' ILIKE :${key}`, {
  //           [key]: `%${value}%`,
  //         });
  //       }
  //     });
  //   }

  //   return await query.take(10).getMany();
  // }

  // async searchByIntent(
  //   intent: CreateShoppingIntentDto,
  //   manager?: EntityManager,
  // ): Promise<Product[]> {
  //   const query = this.repo(manager)
  //     .createQueryBuilder('product')
  //     .leftJoinAndSelect('product.variants', 'variant')
  //     .leftJoinAndSelect('variant.inventory', 'inventory')
  //     .where('product.isPublished = :published', { published: true })
  //     .andWhere('product.status = :status', { status: ProductStatus.PUBLISHED })
  //     // Use maybe manager to ensure consistency in transactions
  //     .andWhere('inventory.stock > :minStock', { minStock: 0 });

  //   // 1. Category Filter
  //   if (intent.categoryId) {
  //     query.andWhere('product.categoryId = :catId', {
  //       catId: intent.categoryId,
  //     });
  //   }

  //   // 2. Specific Product Identifier (High Priority)
  //   if (intent.productIdentifier && intent.productIdentifier !== 'null') {
  //     query.andWhere(
  //       '(product.name ILIKE :pName OR product.slug ILIKE :pName OR product.description ILIKE :pName)',
  //       { pName: `%${intent.productIdentifier}%` },
  //     );
  //   }

  //   // 3. Budget Filter (With Safeguard)
  //   if (intent.budgetLimit && intent.budgetLimit > 100) {
  //     // Safeguard: budget must be realistic
  //     query.andWhere('variant.price <= :maxPrice', {
  //       maxPrice: intent.budgetLimit,
  //     });
  //   }

  //   // 4. Brand & Features Filter
  //   if (
  //     intent.features?.color &&
  //     !['NOT_SPECIFIED', 'null'].includes(intent.features.color)
  //   ) {

  //     if (
  //       intent.productIdentifier?.toLowerCase() !==
  //       intent.features.brand.toLowerCase()
  //     ) {
  //       query.andWhere(
  //         "(variant.attributes->>'color' ILIKE :color OR product.description ILIKE :color)",
  //         { color: `%${intent.features.color}%` },
  //       );
  //     }

  //     // Attributes Loop
  //     Object.entries(intent.features).forEach(([key, value]) => {
  //       if (
  //         value &&
  //         typeof value === 'string' &&
  //         // Yahan check lagayein ke value kaam ki hai ya nahi
  //         !['NOT_SPECIFIED', 'null', 'undefined', 'any'].includes(value) &&
  //         key !== 'attributes' &&
  //         key !== 'brand'
  //       ) {
  //         query.andWhere(`variant.attributes->>'${key}' ILIKE :${key}`, {
  //           [key]: `%${value}%`,
  //         });
  //       }
  //     });
  //   }

  //   // Optimization: Order by latest or price
  //   query.orderBy('product.createdAt', 'DESC');

  //   return await query.take(10).getMany();
  // }

  async searchByIntent(
    intent: CreateShoppingIntentDto,
    manager?: EntityManager,
  ): Promise<Product[]> {
    const query = this.repo(manager)
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.variants', 'variant')
      .leftJoinAndSelect('variant.inventory', 'inventory')
      .where('product.isPublished = :published', { published: true })
      .andWhere('product.status = :status', { status: ProductStatus.PUBLISHED })
      .andWhere('inventory.stock > :minStock', { minStock: 0 });

    // 1. Category Filter
    if (intent.categoryId) {
      query.andWhere('product.categoryId = :catId', {
        catId: intent.categoryId,
      });
    }

    // 2. Product Identifier (Specific Model Search)
    if (intent.productIdentifier && intent.productIdentifier !== 'null') {
      query.andWhere(
        '(product.name ILIKE :pName OR product.slug ILIKE :pName OR product.description ILIKE :pName)',
        { pName: `%${intent.productIdentifier}%` },
      );
    }

    // 3. Budget Filter (Realistic Range)
    if (intent.budgetLimit && intent.budgetLimit > 100) {
      query.andWhere('variant.price <= :maxPrice', {
        maxPrice: intent.budgetLimit,
      });
    }

    // 4. Features & Attributes (Refined Logic)
    if (intent.features) {
      const { brand, attributes, ...restFeatures } = intent.features;

      // Brand Check: Priority search in product name
      if (brand && !['NOT_SPECIFIED', 'null'].includes(brand)) {
        // Avoid redundancy if brand is already in the name search
        if (intent.productIdentifier?.toLowerCase() !== brand.toLowerCase()) {
          query.andWhere('product.name ILIKE :brand', { brand: `%${brand}%` });
        }
      }

      // Dynamic Attributes Loop (Color, Size, etc.)
      // Hum 'restFeatures' use karenge taake Brand exclude ho jaye automatically
      Object.entries(restFeatures).forEach(([key, value]) => {
        if (
          value &&
          typeof value === 'string' &&
          !['NOT_SPECIFIED', 'null', 'undefined', 'any'].includes(value)
        ) {
          // Soft Match: Check in JSON attributes OR Product Description for better UX
          query.andWhere(
            `(variant.attributes->> :key_${key} ILIKE :val_${key} OR product.description ILIKE :val_${key})`,
            {
              [`key_${key}`]: key,
              [`val_${key}`]: `%${value}%`,
            },
          );
        }
      });
    }

    query.orderBy('product.createdAt', 'DESC').take(10);

    return await query.getMany();
  }

  async findByInquiry(
    identifier: string,
    manager?: EntityManager,
  ): Promise<Product | null> {
    return await this.repo(manager)
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.variants', 'variants')
      .leftJoinAndSelect('variants.inventory', 'inventory')
      .where('product.name ILIKE :id', { id: `%${identifier}%` })
      .orWhere('product.slug ILIKE :id', { id: `%${identifier}%` })
      .orWhere('variants.sku ILIKE :id', { id: `%${identifier}%` })
      .getOne();
  }
}
