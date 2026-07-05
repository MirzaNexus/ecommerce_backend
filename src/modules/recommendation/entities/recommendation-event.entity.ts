// entities/recommendation-event.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  CreateDateColumn,
} from 'typeorm';
import { RecommendationEventType } from '../enum/recommendation-event-type.enum';
import type { AlgoliaPayload } from '../interface/algolia-payload.interface';

@Entity('recommendation_events')
@Index(['user_id', 'createdAt'])
@Index(['product_id', 'createdAt'])
export class RecommendationEvent {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  user_id!: string;

  @Column({ type: 'uuid' })
  product_id!: string;

  @Column({ type: 'uuid' })
  category_id!: string;

  @Column({
    type: 'enum',
    enum: RecommendationEventType,
  })
  event_type!: RecommendationEventType;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
  })
  price_at_event!: number;

  @Column({ type: 'int', default: 1 })
  quantity!: number;

  @Column({ type: 'varchar', nullable: true })
  session_id!: string;

  @Column({ type: 'varchar', unique: true })
  idempotency_key!: string;

  @Column({
    type: 'jsonb',
    nullable: true,
  })
  algolia_payload?: AlgoliaPayload;

  @CreateDateColumn()
  createdAt!: Date;
}
