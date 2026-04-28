export class VariantResponseDto {
  id!: string;
  sku!: string;
  price!: number;
  imageUrl?: string;
  stock?: number;
  attributes!: {
    color?: string;
    size?: string;
    material?: string;
    weight?: string;
    dimensions?: {
      height: number;
      width: number;
      length: number;
    };
  };

  static fromEntity(entity: any): VariantResponseDto {
    const dto = new VariantResponseDto();

    dto.id = entity.id;
    dto.sku = entity.sku;
    dto.price = entity.price ? Number(entity.price) : 0;
    dto.imageUrl = entity.imageUrl;
    if (entity.inventory) {
      dto.stock = entity.inventory.stock;
    }
    dto.attributes = entity.attributes || {};

    return dto;
  }
}
