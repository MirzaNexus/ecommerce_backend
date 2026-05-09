import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  Index,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { ChatSession } from './chat-session.entity';
import { Product } from 'src/modules/products/entities/product.entity';

@Entity('recommendation_sessions')
export class RecommendationSession {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  @Index()
  sessionId!: string;

  @ManyToOne(() => ChatSession)
  @JoinColumn({ name: 'sessionId' })
  session!: ChatSession;

  @Column({ type: 'text', nullable: true })
  zeroResultReason!: string;

  @OneToMany(() => RecommendedProduct, (rp) => rp.recommendationSession, {
    cascade: true,
  })
  products!: RecommendedProduct[];

  @CreateDateColumn()
  createdAt!: Date;
}

@Entity('recommended_products')
export class RecommendedProduct {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  recommendationSessionId!: string;

  @ManyToOne(() => RecommendationSession, (session) => session.products, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'recommendationSessionId' })
  recommendationSession!: RecommendationSession;

  @Column({ type: 'uuid' })
  productId!: string;

  @ManyToOne('Product', {
    nullable: false, // Product hona 100% lazmi hai
    onDelete: 'CASCADE', // Agar product catalog se delete ho jaye, toh recommendation bhi khatam ho jaye
  })
  @JoinColumn({ name: 'productId' })
  product!: Product;

  @Column({ type: 'float' })
  rankingScore!: number;

  @Column({ type: 'text' })
  reasoning!: string;

  @Column({ type: 'text', nullable: true })
  name?: string;

  @Column({ type: 'text', nullable: true })
  imageUrl?: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  price?: number;

  @CreateDateColumn()
  createdAt!: Date;
}
