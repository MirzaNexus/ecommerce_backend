import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  Index,
  JoinColumn,
} from 'typeorm';
import { ChatSession } from './chat-session.entity';
import { MessageRole } from '../enums/chatbot.enum';
import type { ITokenUsage } from '../enums/chatbot.enum';

@Entity('chat_messages')
export class ChatMessage {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  @Index()
  sessionId!: string;

  @ManyToOne(() => ChatSession, (session) => session.messages, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'sessionId' })
  session!: ChatSession;

  @Column({ type: 'enum', enum: MessageRole })
  role!: MessageRole;

  @Column({ type: 'text' })
  content!: string;

  @Column({ type: 'text', nullable: true })
  metadata!: string | null;

  @Column({
    type: 'jsonb',
    nullable: true,
  })
  tokenUsage!: ITokenUsage;

  @Column({ type: 'uuid', nullable: true })
  correlationId!: string;

  @CreateDateColumn()
  @Index()
  createdAt!: Date;
}
