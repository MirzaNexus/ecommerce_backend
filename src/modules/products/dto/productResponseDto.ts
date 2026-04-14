import { Product } from '../entities/product.entity';
import { ProductStatus } from '../enums/product-status.enum';
import { VariantResponseDto } from './variant/variant.response.dto';

export class ProductResponseDto {
  id!: string;
  name!: string;
  description?: string;
  categoryId!: string;
  categoryName?: string;
  isPublished!: boolean;
  status!: ProductStatus;
  basePrice?: number;
  slug!: string;
  imageUrl?: string;
  createdAt!: Date;
  updatedAt!: Date;
  variants?: VariantResponseDto[];

  static fromEntity(product: Product): ProductResponseDto {
    const dto = new ProductResponseDto();

    dto.id = product.id;
    dto.name = product.name;
    dto.description = product.description;
    dto.categoryId = product.categoryId;
    dto.isPublished = product.isPublished;
    dto.status = product.status;
    dto.slug = product.slug;
    dto.imageUrl = product.imageUrl;
    dto.createdAt = product.createdAt;
    dto.updatedAt = product.updatedAt;

    dto.basePrice = product.basePrice ? Number(product.basePrice) : 0;

    if (product.category) {
      dto.categoryName = product.category.name;
    }

    if (product.variants && product.variants.length > 0) {
      dto.variants = product.variants.map((v) =>
        VariantResponseDto.fromEntity(v),
      );
    }

    return dto;
  }
}
