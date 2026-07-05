import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  Index,
  ManyToOne,
} from 'typeorm';
import { User } from 'src/modules/user/entities/user.entity';
import type { IAuditData } from '../enums/chatbot.enum';

@Entity('chatbot_audit_logs')
export class ChatbotAuditLog {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  adminId!: string;

  @ManyToOne('User', {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'adminId' })
  admin!: User;

  @Index()
  @Column({
    type: 'uuid',
    nullable: true,
    comment: 'ID of the Rule or Prompt being modified',
  })
  entityId!: string;

  @Column()
  action!: string;

  @Column({ type: 'jsonb' })
  oldValue!: IAuditData;

  @Column({ type: 'jsonb' })
  newValue!: IAuditData;

  @CreateDateColumn()
  createdAt!: Date;
}
