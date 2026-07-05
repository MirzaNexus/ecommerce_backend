import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  OneToMany,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
  OneToOne,
} from 'typeorm';
import { User } from 'src/modules/user/entities/user.entity';
import { ChatMessage } from './chat-message.entity';
import { SessionStatus } from '../enums/chatbot.enum';
import { SessionMetadata } from '../enums/chatbot.enum';
import { ShoppingIntent } from './shopping-intent.entity';

@Entity('chat_sessions')
@Index(['buyerId', 'status']) // Optimized lookup for active sessions
export class ChatSession {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', nullable: true })
  @Index()
  buyerId!: string;

  @ManyToOne('User', 'chatSessions', {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'buyerId' })
  buyer!: User;

  @Column({ type: 'enum', enum: SessionStatus, default: SessionStatus.ACTIVE })
  status!: SessionStatus;

  @Column({ type: 'int', default: 1 })
  contextVersion!: number;

  @Column({ type: 'timestamp' })
  expiresAt!: Date;

  @Column({
    type: 'jsonb',
    nullable: true,
    default: {},
  })
  metadata!: SessionMetadata;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt!: Date;

  @OneToMany(() => ChatMessage, (message) => message.session, { cascade: true })
  messages!: ChatMessage[];

  @OneToOne(() => ShoppingIntent, (intent) => intent.session)
  intent!: ShoppingIntent;
}
