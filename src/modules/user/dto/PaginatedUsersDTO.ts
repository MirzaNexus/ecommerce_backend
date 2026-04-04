import { UserStatus, UserRole } from '../entities/user.entity';
import { AddressType } from '../entities/user-address.entity';

export class PaginatedUsersDTO {
  data!: AdminUserListDTO[];
  meta!: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
export class AdminUserListDTO {
  id!: string;
  firstName!: string;
  lastName?: string;
  email!: string;
  status!: UserStatus;
  role!: UserRole;
  createdAt!: Date;
}

export class AdminUserDTO {
  id!: string;
  firstName!: string;
  lastName?: string;
  email!: string;
  phone?: string;
  status!: UserStatus;
  role!: UserRole;
  addresses!: AddressResponseDTO[];
  createdAt!: Date;
}

export class AddressResponseDTO {
  id!: string;
  line1!: string;
  line2?: string;
  city!: string;
  state?: string;
  postalCode?: string;
  country!: string;
  type!: AddressType;
  isDefault!: boolean;
}
