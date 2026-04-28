import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  Index,
} from 'typeorm';
import { Order } from './order.entity';

export interface VariantSnapshot {
  sku: string;
  attributes?: {
    color?: string;
    size?: string;
    material?: string;
    weight?: string;
    dimensions?: {
      height: number;
      width: number;
      length: number;
    };
  };
}

@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @ManyToOne(() => Order, (order) => order.items, { onDelete: 'CASCADE' })
  order!: Order;

  @Index()
  @Column({ type: 'uuid', comment: 'Reference to the specific Variant SKU' })
  productVariantId!: string;

  @Column()
  productName!: string;

  @Column({ nullable: true })
  productImage?: string;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
  })
  price!: number; // Historical price at checkout

  @Column({ type: 'int' })
  quantity!: number;

  @Column({
    type: 'jsonb',
    nullable: true,
    comment: 'Color, Size, SKU snapshot',
  })
  variantData!: VariantSnapshot;

  @CreateDateColumn()
  createdAt!: Date;
}
