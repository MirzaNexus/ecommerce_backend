import {
  Entity,
  Column,
  ManyToOne,
  OneToOne,
  Index,
  Unique,
  JoinColumn,
} from 'typeorm';
import { BaseEntity } from 'src/common/entities/base.entity';
import { Product } from './product.entity';
import { Inventory } from './inventory.entity';
import { type InvariantAttributes } from '../types/variant-attributes.interface';

@Entity('variants')
@Index(['productId'])
@Index(['productId', 'price'])
@Unique('UQ_product_sku', ['productId', 'sku'])
export class Variant extends BaseEntity {
  @Column({ type: 'uuid' })
  productId!: string;

  @ManyToOne(() => Product, (product) => product.variants, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'productId' })
  product!: Product;

  @Column({ type: 'varchar' })
  @Index()
  sku!: string;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  price!: number;

  @Column({ type: 'jsonb', nullable: true })
  attributes?: InvariantAttributes;

  @OneToOne(() => Inventory, (inventory) => inventory.variant)
  inventory!: Inventory;
}
