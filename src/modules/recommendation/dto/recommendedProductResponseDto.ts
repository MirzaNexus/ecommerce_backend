import { Expose, Type } from 'class-transformer';

export class RecommendedProductResponseDto {
  @Expose()
  id!: string;

  @Expose()
  name!: string;

  @Expose()
  price!: number;

  @Expose()
  category_id!: string;

  @Expose()
  image_url!: string;

  @Expose()
  recommendation_score!: number; // The AI confidence score from Algolia
}

export class RecommendationListResponseDto {
  @Expose()
  @Type(() => RecommendedProductResponseDto)
  items!: RecommendedProductResponseDto[];

  @Expose()
  total!: number;

  @Expose()
  totalPages!: number;

  @Expose()
  source!: 'algolia' | 'fallback_db'; // Tells frontend if AI or fallback was used

  @Expose()
  request_id!: string; // Correlation ID for support/logs
}
