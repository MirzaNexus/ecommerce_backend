import {
  Entity,
  Column,
  ManyToOne,
  OneToMany,
  Index,
  JoinColumn,
} from 'typeorm';
import { BaseEntity } from 'src/common/entities/base.entity';
import { Category } from './category.entity';
import { Variant } from './variant.entity';
import { ProductStatus } from '../enums/product-status.enum';

@Entity('products')
@Index(['isPublished', 'categoryId', 'basePrice'])
export class Product extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'uuid' })
  @Index()
  categoryId!: string;

  @ManyToOne(() => Category, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'categoryId' })
  category!: Category;

  @Column({ type: 'boolean', default: false })
  @Index()
  isPublished!: boolean;

  @Column({
    type: 'enum',
    enum: ProductStatus,
    default: ProductStatus.DRAFT,
  })
  status!: ProductStatus;

  @Column({ type: 'numeric', precision: 10, scale: 2, nullable: true })
  basePrice?: number;

  @Column({ type: 'varchar', unique: true })
  @Index()
  slug!: string;

  @Column({ type: 'varchar', nullable: true })
  imageUrl?: string;

  @OneToMany(() => Variant, (variant) => variant.product)
  variants!: Variant[];
}
