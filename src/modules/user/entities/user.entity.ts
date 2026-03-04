import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
  OneToMany,
} from 'typeorm';
import { Exclude, Expose } from 'class-transformer';
import { UserAddress } from './user-address.entity';

export enum UserStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
}
export enum UserRole {
  ADMIN = 'admin',
  BUYER = 'buyer',
}

@Entity('users')
@Index('idx_users_status', ['status'])
@Index('idx_users_role', ['role'])
@Index('idx_users_deleted_null', ['id'], {
  where: `"deleted_at" IS NULL`,
})
@Index('ux_users_phone_active', ['phone'], {
  unique: true,
  where: `"deleted_at" IS NULL AND phone IS NOT NULL`,
})
@Index('ux_users_email_active', ['email'], {
  unique: true,
  where: `"deleted_at" IS NULL`,
})
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Exclude()
  @Column({ name: 'auth_user_id', type: 'uuid', unique: true, nullable: true })
  authUserId?: string;

  // Profile fields
  @Column({ name: 'first_name', length: 100 })
  firstName: string;

  @Column({ name: 'last_name', length: 100, nullable: true })
  lastName?: string;

  @Column({ length: 255 })
  email: string;

  @Column({ length: 20, nullable: true })
  phone?: string;

  @Column({ name: 'avatar_url', type: 'text', nullable: true })
  avatarUrl?: string;

  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.ACTIVE,
  })
  status: UserStatus;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.BUYER })
  role: UserRole;

  // Soft delete
  @Exclude()
  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt?: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => UserAddress, (address) => address.user)
  addresses: UserAddress[];

  @Expose()
  get fullName(): string {
    return `${this.firstName} ${this.lastName ?? ''}`.trim();
  }
}
