// src/modules/guided-shopping/domain/entities/chatbot-interaction.entity.ts

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { PromptTemplate } from './prompt-template.entity';

@Entity('chatbot_interactions')
export class ChatbotInteraction {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  sessionId!: string;

  @Column({ type: 'uuid' })
  promptTemplateId!: string;

  @ManyToOne(() => PromptTemplate)
  @JoinColumn({ name: 'promptTemplateId' })
  promptTemplate!: PromptTemplate;

  @Column({ default: false })
  isZeroResult!: boolean; // True agar koi product nahi mila

  @Column({ nullable: true })
  userIntent!: string; // e.g., "buying_laptop"

  @Column({ type: 'jsonb', nullable: true })
  metadata!: Record<string, any>; // Search filters used

  @CreateDateColumn()
  createdAt!: Date;
}
