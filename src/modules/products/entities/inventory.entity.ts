import { Entity, Column, OneToOne, JoinColumn, Check, Index } from 'typeorm';
import { BaseEntity } from 'src/common/entities/base.entity';
import { Variant } from './variant.entity';

@Entity('inventory')
@Check(`"stock" >= 0`)
@Index(['variantId', 'stock'])
export class Inventory extends BaseEntity {
  @Column({ type: 'uuid', unique: true })
  @Index()
  variantId!: string;

  @OneToOne(() => Variant, (variant) => variant.inventory, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'variantId' })
  variant!: Variant;

  @Column({ type: 'integer', default: 0 })
  stock!: number;
}
