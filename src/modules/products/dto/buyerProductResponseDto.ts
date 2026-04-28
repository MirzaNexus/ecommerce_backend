import { GetBuyerProductsQueryDto } from './getBuyerProductQueryDto';
import { Product } from '../entities/product.entity';

export class BuyerProductResponseDto {
  id!: string;
  name!: string;
  slug!: string;
  description!: string;
  basePrice!: number;
  imageUrl!: string;
  categoryName!: string;
  categoryId!: string;
  variantCount!: number;
  minPrice!: number;
  maxPrice!: number;

  static fromEntity(
    p: Product,
    query: GetBuyerProductsQueryDto,
  ): BuyerProductResponseDto {
    let relevantVariants = p.variants || [];

    if (query.color || query.size || query.material) {
      relevantVariants = relevantVariants.filter((v) => {
        const attr = v.attributes;
        const colorMatch =
          !query.color ||
          attr?.color?.toLowerCase() === query.color.toLowerCase();
        const sizeMatch =
          !query.size || attr?.size?.toLowerCase() === query.size.toLowerCase();
        const materialMatch =
          !query.material ||
          attr?.material?.toLowerCase() === query.material.toLowerCase();
        return colorMatch && sizeMatch && materialMatch;
      });
    }

    const prices = relevantVariants.map((v) => v.price);
    const minPrice = prices.length > 0 ? Math.min(...prices) : p.basePrice;
    const maxPrice = prices.length > 0 ? Math.max(...prices) : p.basePrice;

    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      description: p.description ?? '',
      basePrice: p.basePrice ?? 0,
      imageUrl: relevantVariants[0]?.imageUrl || p.imageUrl || '',
      categoryName: p.category?.name || 'Uncategorized',
      categoryId: p.categoryId,
      variantCount: relevantVariants.length,
      minPrice: minPrice ?? 0,
      maxPrice: maxPrice ?? 0,
    };
  }
}

export class PaginatedBuyerProductsDto {
  data!: BuyerProductResponseDto[];
  meta!: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
