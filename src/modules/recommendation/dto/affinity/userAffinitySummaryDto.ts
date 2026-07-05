import { Expose } from 'class-transformer';

export class UserAffinitySummaryDto {
  @Expose()
  category_id!: string;

  @Expose()
  affinity_score!: number;

  @Expose()
  interest_level!: 'low' | 'medium' | 'high'; // Derived logic in service
}
