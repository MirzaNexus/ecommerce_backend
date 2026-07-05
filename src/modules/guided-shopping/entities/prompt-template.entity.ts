// src/modules/guided-shopping/domain/entities/prompt-template.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { TemplateType } from '../enums/chatbot.enum';

@Entity('prompt_templates')
export class PromptTemplate {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'enum', enum: TemplateType })
  type!: TemplateType;

  @Column({ type: 'text' })
  content!: string;

  @Column({ type: 'int', default: 1 })
  version!: number;

  @Column({ type: 'boolean', default: false })
  isActive!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
