import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('user_category_affinity')
@Index(['user_id', 'category_id'], { unique: true })
export class UserCategoryAffinity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  user_id!: string;

  @Column({ type: 'uuid' })
  category_id!: string;

  @Column({ type: 'int', default: 0 })
  view_count!: number;

  @Column({ type: 'int', default: 0 })
  add_to_cart_count!: number;

  @Column({ type: 'int', default: 0 })
  purchase_count!: number;

  @Column({ type: 'float', default: 0 })
  affinity_score!: number;

  @UpdateDateColumn()
  updatedAt!: Date;
}
