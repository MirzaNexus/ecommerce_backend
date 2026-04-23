import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('newsletter_subscriptions')
export class NewsletterSubscription {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  email!: string;

  @Column({ default: true })
  isSubscribed!: boolean;

  @Column({ type: 'uuid', nullable: true })
  userId!: string | null;

  @Column({ type: 'text', nullable: true })
  fcmToken!: string | null;

  @CreateDateColumn()
  createdAt!: Date;
}
