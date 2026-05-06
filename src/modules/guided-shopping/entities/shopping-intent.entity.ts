// src/modules/guided-shopping/domain/entities/shopping-intent.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { ChatSession } from './chat-session.entity';
import type { IShoppingFeatures } from '../enums/chatbot.enum';
import { Category } from 'src/modules/products/entities/category.entity';

@Entity('shopping_intents')
export class ShoppingIntent {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  sessionId!: string;

  @OneToOne(() => ChatSession, (session) => session.intent, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'sessionId' })
  session!: ChatSession;

  @Column({ type: 'varchar', nullable: true })
  productIdentifier!: string | null;

  @Column({ type: 'uuid', nullable: true })
  categoryId!: string;

  @ManyToOne('Category', {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'categoryId' })
  category!: Category;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  budgetLimit!: number;

  @Column({ type: 'text', array: true, nullable: true })
  preferredBrands!: string[];

  @Column({
    type: 'jsonb',
    nullable: true,
    default: {},
  })
  features!: IShoppingFeatures;

  @Column({ type: 'float', default: 0 })
  extractionConfidence!: number;

  @Column({ type: 'int', default: 1 })
  version!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
