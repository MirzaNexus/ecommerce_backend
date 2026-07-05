import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  UpdateDateColumn,
  CreateDateColumn,
  VersionColumn,
  Index,
} from 'typeorm';

@Entity('recommendation_settings')
@Index(['enabled'])
export class RecommendationSettings {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ default: true })
  enabled!: boolean;

  @Column({ type: 'int', default: 20 })
  related_products_limit!: number;

  @Column({ type: 'float', default: 1.0 })
  price_similarity_factor!: number;

  @Column({ type: 'boolean', default: true })
  category_priority_enabled!: boolean;

  @VersionColumn() //Optimistic Locking
  version!: number;

  @Column({ type: 'boolean', default: true })
  fallback_enabled!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
