// src/modules/guided-shopping/domain/entities/chatbot-rule.entity.ts

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('chatbot_rules')
export class ChatbotRule {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string; // e.g., "Premium Laptop Priority"

  @Column({ type: 'jsonb' })
  conditions!: {
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    keywords?: string[];
  };

  @Column({ type: 'jsonb' })
  actions!: {
    boostBrand?: string; // e.g., "Apple"
    sortBy?: 'price_asc' | 'price_desc';
    customMessage?: string;
  };

  @Column({ type: 'int', default: 1 })
  priority!: number; // Higher number = Higher priority

  @Column({ type: 'boolean', default: true })
  isActive!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
