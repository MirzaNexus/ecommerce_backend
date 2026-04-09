import { Product } from '../entities/product.entity';
import { ProductStatus } from '../enums/product-status.enum';

export class ProductResponseDto {
  id!: string;
  name!: string;
  description?: string;
  categoryId!: string;
  isPublished!: boolean;
  status!: ProductStatus;
  basePrice?: number;
  slug!: string;
  imageUrl!: string;
  createdAt!: Date;
  updatedAt!: Date;

  static fromEntity(product: Product): ProductResponseDto {
    return {
      id: product.id,
      name: product.name,
      description: product.description,
      categoryId: product.categoryId,
      isPublished: product.isPublished,
      status: product.status,
      basePrice: product.basePrice,
      slug: product.slug,
      imageUrl: product.imageUrl,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }
}
