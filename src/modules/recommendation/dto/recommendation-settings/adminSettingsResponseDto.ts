import { Expose } from 'class-transformer';

export class AdminSettingsResponseDto {
  @Expose()
  id!: string;

  @Expose()
  enabled!: boolean;

  @Expose()
  related_products_limit!: number;

  @Expose()
  price_similarity_factor!: number;

  @Expose()
  category_priority_enabled!: boolean;

  @Expose()
  version!: number; // For optimistic locking UI feedback

  @Expose()
  updatedAt!: Date;
}
