import { Injectable } from '@nestjs/common';
import { Repository, EntityManager, FindOptionsWhere, IsNull } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from '../entities/category.entity';

@Injectable()
export class CategoryRepository {
  constructor(
    @InjectRepository(Category)
    private readonly repo: Repository<Category>,
  ) {}

  private getRepo(manager?: EntityManager): Repository<Category> {
    return manager ? manager.getRepository(Category) : this.repo;
  }

  async exists(
    where: FindOptionsWhere<Category>,
    manager?: EntityManager,
  ): Promise<boolean> {
    const repo = this.getRepo(manager);
    return await repo.exists({
      where: {
        ...where,
        deletedAt: IsNull(),
      },
    });
  }

  async hasChildren(
    parentId: string,
    manager?: EntityManager,
  ): Promise<boolean> {
    return this.exists({ parentId }, manager);
  }

  async create(
    categoryData: Partial<Category>,
    manager?: EntityManager,
  ): Promise<Category> {
    const repo = this.getRepo(manager);
    const category = repo.create(categoryData);
    return await repo.save(category);
  }

  async findById(
    id: string,
    manager?: EntityManager,
    includeDeleted = false,
  ): Promise<Category | null> {
    const repo = this.getRepo(manager);
    return await repo.findOne({
      where: {
        id,
        ...(includeDeleted ? {} : { deletedAt: IsNull() }),
      },
    });
  }

  async existsByName(name: string, manager?: EntityManager): Promise<boolean> {
    const repo = this.getRepo(manager);

    return await this.exists(
      {
        name,
      },
      manager,
    );
  }

  async findAll(
    options?: { includeDeleted?: boolean },
    manager?: EntityManager,
  ): Promise<Category[]> {
    const repo = this.getRepo(manager);

    if (options?.includeDeleted) {
      return repo.find({
        withDeleted: true,
        order: { name: 'ASC' },
      });
    }

    return repo.find({
      relations: ['parent'],
      where: { deletedAt: IsNull() },
      order: { name: 'ASC' },
    });
  }

  async updatePartial(
    id: string,
    data: Partial<Category>,
    manager?: EntityManager,
  ): Promise<void> {
    const repo = this.getRepo(manager);

    await repo.update(id, data);
  }

  async softDelete(id: string, manager?: EntityManager): Promise<void> {
    const repo = this.getRepo(manager);

    await repo.softDelete(id);
  }

  async restore(id: string, manager?: EntityManager): Promise<void> {
    const repo = this.getRepo(manager);

    await repo.restore(id);
  }
}
