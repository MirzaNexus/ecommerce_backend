import { Injectable } from '@nestjs/common';

@Injectable()
export class RecommendationIndexer {
  formatProductForAlgolia(product: any) {
    // Sum up stock from all variants
    const totalStock =
      product.variants?.reduce((sum: number, variant: any) => {
        return sum + (variant.inventory?.stock || 0);
      }, 0) || 0;

    return {
      objectID: product.id,
      name: product.name,
      basePrice: product.basePrice,
      category_id: product.categoryId,
      imageUrl: product.imageUrl,
      isPublished: product.isPublished,
      stock: totalStock,
    };
  }
}
