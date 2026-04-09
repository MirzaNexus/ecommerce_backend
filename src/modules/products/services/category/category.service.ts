import {
  Injectable,
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { CategoryRepository } from '../../repositories/category.repository';
import { CreateCategoryDto } from '../../dto/category/create-category.dto';
import { UpdateCategoryDto } from '../../dto/category/update-category.dto';
import { ProductRepository } from '../../repositories/product.repositry';
import { Category } from '../../entities/category.entity';
import { EntityManager } from 'typeorm';

export type CategoryTreeNode = {
  id: string;
  name: string;
  parentId?: string;
  children: CategoryTreeNode[];
};

@Injectable()
export class CategoryService {
  constructor(
    private readonly categoryRepo: CategoryRepository,
    private readonly productRepo: ProductRepository,
    private readonly dataSource: DataSource,
  ) {}

  async createCategory(dto: CreateCategoryDto) {
    const name = dto.name.trim().toLowerCase();

    const exists = await this.categoryRepo.existsByName(name);
    if (exists) throw new ConflictException('Category already exists');

    let parent: Category | null = null;

    if (dto.parentId) {
      parent = await this.categoryRepo.findById(dto.parentId);
      if (!parent) throw new BadRequestException('Invalid parentId');
    }

    const saved = await this.categoryRepo.create({
      name,
      parent: parent ?? undefined,
      parentId: dto.parentId,
    });

    return this.mapToDto(saved);
  }

  async getAllCategoriesAdmin() {
    const categories = await this.categoryRepo.findAll();

    return categories.map(this.mapToDto);
  }

  async getAllCategoriesAdminNested() {
    const categories = await this.categoryRepo.findAll();

    return this.buildTree(categories);
  }

  async updateCategory(id: string, dto: UpdateCategoryDto) {
    return this.dataSource.transaction(async (manager) => {
      const category = await this.categoryRepo.findById(id, manager);
      if (!category) throw new NotFoundException('Category not found');

      if (dto.name) {
        const name = dto.name.trim().toLowerCase();

        const exists = await this.categoryRepo.existsByName(name, manager);
        if (exists && name !== category.name) {
          throw new ConflictException('Category name already exists');
        }

        category.name = name;
      }

      if (dto.parentId !== undefined) {
        if (dto.parentId === id) {
          throw new BadRequestException('Cannot set self as parent');
        }

        let parent: Category | null = null;

        if (dto.parentId) {
          parent = await this.categoryRepo.findById(dto.parentId, manager);
          if (!parent) throw new BadRequestException('Invalid parentId');

          await this.checkCircularRelation(id, dto.parentId, manager);
        }

        category.parent = parent as any;
        category.parentId = parent?.id;
      }

      await this.categoryRepo.updatePartial(id, category, manager);

      return this.mapToDto({ ...category, id });
    });
  }

  async deleteCategory(id: string) {
    return this.dataSource.transaction(async (manager) => {
      const category = await this.categoryRepo.findById(id, manager);

      if (!category) {
        throw new NotFoundException('Category not found');
      }
      const hasChildren = await this.categoryRepo.hasChildren(id, manager);

      if (hasChildren) {
        throw new ConflictException('Category has sub-categories');
      }

      const hasProducts = await this.productRepo.existsByCategoryId(
        id,
        manager,
      );

      if (hasProducts) {
        throw new ConflictException(
          'Category cannot be deleted because it has linked products',
        );
      }
      await this.categoryRepo.softDelete(id, manager);

      return { message: 'Category deleted successfully' };
    });
  }

  private buildTree(categories: Category[]): CategoryTreeNode[] {
    const map = new Map<string, CategoryTreeNode>();
    const roots: CategoryTreeNode[] = [];

    // Step 1: create map
    for (const cat of categories) {
      map.set(cat.id, {
        id: cat.id,
        name: cat.name,
        parentId: cat.parentId,
        children: [],
      });
    }

    for (const cat of categories) {
      const node = map.get(cat.id);

      if (!node) continue;

      if (cat.parentId && map.has(cat.parentId)) {
        const parentNode = map.get(cat.parentId);

        if (parentNode) {
          parentNode.children.push(node);
        }
      } else {
        roots.push(node);
      }
    }

    return roots;
  }

  private async checkCircularRelation(
    categoryId: string,
    parentId: string,
    manager?: EntityManager, // Manager ko optional aur type-safe rakhein
  ) {
    let current: string | undefined = parentId;

    while (current) {
      if (current === categoryId) {
        throw new BadRequestException(
          'A category cannot be its own child (Circular Relationship)',
        );
      }
      const parent = await this.categoryRepo.findById(current, manager);
      current = parent?.parentId;
      if (!parent) break;
    }
  }

  private mapToDto(category: Category) {
    return {
      ...category.children,
      deletedAt: category.deletedAt ?? null,
    };
  }
}
