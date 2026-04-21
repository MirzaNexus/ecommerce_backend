import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  Index,
} from 'typeorm';
import { Order } from './order.entity';
import { PaymentStatus } from '../enums/payment-status.enum';

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @ManyToOne(() => Order, (order) => order.payments)
  order!: Order;

  @Column({ unique: true })
  transactionId!: string;

  @Column()
  provider!: string; // e.g., 'STRIPE', 'PAYPAL'

  @Index()
  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  status!: PaymentStatus;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount!: number;

  @Column()
  currency!: string;

  @Column({ type: 'jsonb', nullable: true })
  gatewayResponse!: Record<string, any>;

  @Column({ type: 'varchar', unique: true, nullable: true })
  idempotencyKey!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
