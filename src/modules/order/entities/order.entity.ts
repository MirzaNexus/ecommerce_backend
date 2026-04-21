import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  OneToMany,
  JoinColumn,
  ManyToOne,
} from 'typeorm';

import { OrderStatus } from '../enums/order-status.enum';
import { OrderItem } from './order-item.entity';
import { Payment } from './payment.entity';
import { User } from 'src/modules/user/entities/user.entity';

export interface AddressSnapshot {
  fullName: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  postalCode?: string;
  country: string;
}

@Entity('orders')
@Index(['userId', 'status'])
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ type: 'uuid' })
  userId!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user!: User;

  @Column({
    type: 'uuid',
    nullable: true,
    comment: 'Link to profile address if used',
  })
  userAddressId!: string | null;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.CREATED,
  })
  status!: OrderStatus;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
  })
  totalAmount!: number;

  @Column({ type: 'jsonb', comment: 'Typed snapshot of delivery address' })
  addressSnapshot!: AddressSnapshot;

  @Column({ type: 'varchar', unique: true, nullable: true })
  idempotencyKey!: string;

  @Column({ type: 'timestamp', nullable: true, comment: 'Concurrency lock' })
  lockedAt!: Date | null;

  @OneToMany(() => OrderItem, (item) => item.order, { cascade: true })
  items!: OrderItem[];

  @OneToMany(() => Payment, (payment) => payment.order)
  payments!: Payment[];

  @Index()
  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
