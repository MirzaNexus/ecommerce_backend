import {
  ConflictException,
  NotFoundException,
  Injectable,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { RegisterBuyerDto } from '../dto/create-user.dto';
import { UserRepository } from '../repositories/user.repository';
import { AuthService } from 'src/modules/auth/services/auth.service';
import { UpdateProfileDto } from '../dto/update-user.dto';
import { EntityManager } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly userRepo: UserRepository,
    @Inject(forwardRef(() => AuthService)) private authService: AuthService,
  ) {}

  async registerBuyer(dto: RegisterBuyerDto) {
    return this.dataSource.transaction(async (manager) => {
      const existingUser = await this.userRepo.findByEmail(dto.email, manager);

      if (existingUser) {
        throw new ConflictException('Email already exists');
      }

      const user = await this.userRepo.createUser(
        {
          firstName: dto.firstName,
          lastName: dto.lastName,
          email: dto.email,
          phone: dto.phone,
        },
        manager,
      );

      await this.authService.createCredentials(manager, user.id, dto.password);

      return {
        success: true,
        message: 'Buyer registered successfully',
        data: {
          userId: user.id,
          email: user.email,
          role: user.role,
        },
      };
    });
  }

  async findByEmail(email: string, manager?: EntityManager) {
    return this.userRepo.findByEmail(email, manager);
  }
  async findById(id: string, manager?: EntityManager) {
    return this.userRepo.findById(id);
  }

  async getMyProfile(userId: string) {
    const user = await this.userRepo.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      avatarUrl: user.avatarUrl ?? null,
    };
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.userRepo.findById(userId);

    if (!user) throw new NotFoundException('User not found');

    await this.userRepo.updateProfile(user.id, dto);

    return await this.getMyProfile(userId);
  }
}
