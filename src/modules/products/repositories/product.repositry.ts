import { Injectable } from '@nestjs/common';
import { Repository, EntityManager, FindOptionsWhere, IsNull } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from '../entities/product.entity';
import { GetAllProductsQueryDto } from '../dto/getAllProductsQueryDto';

@Injectable()
export class ProductRepository {
  constructor(private readonly manager: EntityManager) {}

  private repo(manager?: EntityManager): Repository<Product> {
    return (manager ?? this.manager).getRepository(Product);
  }

  async create(product: Product, manager?: EntityManager): Promise<Product> {
    return await this.repo(manager).save(product);
  }

  async findById(id: string, manager?: EntityManager): Promise<Product | null> {
    return await this.repo(manager).findOne({
      where: { id, deletedAt: IsNull() },
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
}
