import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { UserRepository } from '../../repositories/user.repository';
import { AdminUserDTO, PaginatedUsersDTO } from '../../dto/PaginatedUsersDTO';
import { UpdateUserStatusDto } from '../../dto/UpdateUserStatusDto';

@Injectable()
export class AdminUserService {
  constructor(private userRepo: UserRepository) {}

  async getUsers(
    page = 1,
    limit = 20,
    status?: string,
  ): Promise<PaginatedUsersDTO> {
    if (page < 1) throw new BadRequestException('Page must be >= 1');
    if (limit > 100) throw new BadRequestException('Limit max 100');

    const { users, total } = await this.userRepo.findPaginated(
      page,
      limit,
      status,
    );
    const totalPages = Math.ceil(total / limit);
    return {
      data: users,
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  async getUserById(userId: string): Promise<AdminUserDTO> {
    const user = await this.userRepo.getUserWithAddress(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      status: user.status,
      role: user.role,
      createdAt: user.createdAt,

      addresses:
        user.addresses?.map((address) => ({
          id: address.id,
          line1: address.line1,
          line2: address.line2,
          city: address.city,
          state: address.state,
          postalCode: address.postalCode,
          country: address.country,
          type: address.type,
          isDefault: address.isDefault,
        })) || [],
    };
  }

  async updateUserStatus(userId: string, dto: UpdateUserStatusDto) {
    const user = await this.userRepo.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const data = await this.userRepo.updateStatus(userId, dto.status);
    return {
      success: true,
      message: 'User status updated',
      name: data?.fullName,
      status: data?.status,
    };
  }
}

//  async updateUserStatus(
//     adminId: string,
//     userId: string,
//     dto: UpdateUserStatusDto,
//   ) {
//     const user = await this.userRepo.findById(userId);

//     if (!user) {
//       throw new NotFoundException('User not found');
//     }

//     await this.dataSource.transaction(async (manager) => {
//       await this.userRepo.updateStatus(userId, dto.status, manager);

//       await this.auditLog.log({
//         actorId: adminId,
//         action: 'USER_STATUS_UPDATED',
//         targetId: userId,
//         meta: { status: dto.status },
//       });
//     });

//     return {
//       success: true,
//       message: 'User status updated',
//     };
//   }
// }
